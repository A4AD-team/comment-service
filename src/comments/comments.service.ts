import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { CommentsRepository, PaginatedComments } from './comments.repository';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import {
  CommentResponse,
  PaginatedCommentsResponse,
  mapCommentToResponse,
} from './interfaces/comment-response.interface';
import { CommentEventProducer } from './events/comment.events';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as unknown as Window);

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly eventProducer: CommentEventProducer,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    requestId?: string,
  ): Promise<CommentResponse> {
    const sanitizedContent = DOMPurify.sanitize(createCommentDto.content);

    const comment = await this.commentsRepository.create({
      commentId: uuidv4(),
      postId: createCommentDto.postId,
      parentCommentId: createCommentDto.parentCommentId,
      authorId: createCommentDto.authorId,
      content: sanitizedContent,
      likesCount: 0,
      isDeleted: false,
    });

    await this.eventProducer.publishCommentCreated(comment, requestId);

    return mapCommentToResponse(comment);
  }

  async findAll(
    query: GetCommentsQueryDto,
  ): Promise<PaginatedCommentsResponse<CommentResponse>> {
    if (!query.postId) {
      throw new ForbiddenException('postId is required');
    }

    const result: PaginatedComments<Comment> =
      await this.commentsRepository.findByPostIdWithCursor(
        query.postId,
        query.cursor,
        query.limit,
        query.sort,
      );

    return {
      items: result.items.map(mapCommentToResponse),
      nextCursor: result.nextCursor,
      totalCount: result.totalCount,
    };
  }

  async findOne(commentId: string): Promise<CommentResponse> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return mapCommentToResponse(comment);
  }

  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
    requestId?: string,
  ): Promise<CommentResponse> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    if (comment.isDeleted) {
      throw new ForbiddenException('Cannot edit deleted comments');
    }

    const sanitizedContent = updateCommentDto.content
      ? DOMPurify.sanitize(updateCommentDto.content)
      : comment.content;

    const updated = await this.commentsRepository.findByIdAndUpdate(commentId, {
      content: sanitizedContent,
    });

    if (!updated) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    await this.eventProducer.publishCommentUpdated(updated, requestId);

    return mapCommentToResponse(updated);
  }

  async remove(
    commentId: string,
    userId: string,
    isModerator: boolean = false,
    requestId?: string,
  ): Promise<void> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (!isModerator && comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    if (comment.isDeleted) {
      throw new ConflictException('Comment is already deleted');
    }

    const deleted = await this.commentsRepository.softDelete(commentId, userId);

    if (deleted) {
      await this.eventProducer.publishCommentDeleted(deleted, requestId);
    }
  }

  async restore(
    commentId: string,
    userId: string,
    requestId?: string,
  ): Promise<CommentResponse> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (!comment.isDeleted) {
      throw new ConflictException('Comment is not deleted');
    }

    const restored = await this.commentsRepository.restore(commentId);

    if (!restored) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    await this.eventProducer.publishCommentRestored(restored, requestId);

    return mapCommentToResponse(restored);
  }

  async like(
    commentId: string,
    userId: string,
    requestId?: string,
  ): Promise<CommentResponse> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.isDeleted) {
      throw new ForbiddenException('Cannot like deleted comments');
    }

    const liked = await this.commentsRepository.incrementLikes(commentId);

    if (!liked) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    await this.eventProducer.publishCommentLiked(liked, userId, requestId);

    return mapCommentToResponse(liked);
  }

  async unlike(
    commentId: string,
    userId: string,
    requestId?: string,
  ): Promise<CommentResponse> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    const unliked = await this.commentsRepository.decrementLikes(commentId);

    if (!unliked) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    await this.eventProducer.publishCommentUnliked(unliked, userId, requestId);

    return mapCommentToResponse(unliked);
  }

  async handlePostDeleted(postId: string, requestId?: string): Promise<number> {
    const count = await this.commentsRepository.softDeleteByPostId(postId);

    if (count > 0) {
      await this.eventProducer.publishCommentsBulkDeleted(
        postId,
        count,
        requestId,
      );
    }

    return count;
  }
}
