import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';

export interface PaginatedComments<T> {
  items: T[];
  nextCursor?: string;
  prevCursor?: string;
  totalCount: number;
}

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  async create(commentData: Partial<Comment>): Promise<Comment> {
    const comment = new this.commentModel(commentData);
    return comment.save();
  }

  async findById(commentId: string): Promise<Comment | null> {
    return this.commentModel.findOne({ commentId }).exec();
  }

  async findByIdAndUpdate(
    commentId: string,
    updateData: Partial<Comment>,
  ): Promise<Comment | null> {
    return this.commentModel
      .findOneAndUpdate({ commentId }, updateData, { new: true })
      .exec();
  }

  async softDelete(
    commentId: string,
    deletedBy: string,
  ): Promise<Comment | null> {
    return this.commentModel
      .findOneAndUpdate(
        { commentId },
        { isDeleted: true, deletedAt: new Date(), deletedBy },
        { new: true },
      )
      .exec();
  }

  async restore(commentId: string): Promise<Comment | null> {
    return this.commentModel
      .findOneAndUpdate(
        { commentId },
        { isDeleted: false, $unset: { deletedAt: 1, deletedBy: 1 } },
        { new: true },
      )
      .exec();
  }

  async softDeleteByPostId(postId: string): Promise<number> {
    const result = await this.commentModel
      .updateMany(
        { postId, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
      )
      .exec();
    return result.modifiedCount;
  }

  async incrementLikes(commentId: string): Promise<Comment | null> {
    return this.commentModel
      .findOneAndUpdate(
        { commentId },
        { $inc: { likesCount: 1 } },
        { new: true },
      )
      .exec();
  }

  async decrementLikes(commentId: string): Promise<Comment | null> {
    return this.commentModel
      .findOneAndUpdate(
        { commentId, likesCount: { $gt: 0 } },
        { $inc: { likesCount: -1 } },
        { new: true },
      )
      .exec();
  }

  async findByPostIdWithCursor(
    postId: string,
    cursor?: string,
    limit: number = 20,
    sortDirection: 'desc' | 'asc' = 'desc',
  ): Promise<PaginatedComments<Comment>> {
    const filter: FilterQuery<Comment> = { postId, isDeleted: false };

    if (cursor) {
      const cursorDate = new Date(Buffer.from(cursor, 'base64').toString());
      filter.createdAt =
        sortDirection === 'desc' ? { $lt: cursorDate } : { $gt: cursorDate };
    }

    const sort: { [key: string]: SortOrder } = {
      createdAt: sortDirection === 'desc' ? -1 : 1,
    };

    const comments = await this.commentModel
      .find(filter)
      .sort(sort)
      .limit(limit + 1)
      .exec();

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;

    let nextCursor: string | undefined;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      if (lastItem.createdAt) {
        nextCursor = Buffer.from(lastItem.createdAt.toISOString()).toString(
          'base64',
        );
      }
    }

    const totalCount = await this.commentModel
      .countDocuments({
        postId,
        isDeleted: false,
      })
      .exec();

    return {
      items,
      nextCursor,
      totalCount,
    };
  }

  async findNestedByPostId(
    postId: string,
    parentCommentId?: string,
  ): Promise<Comment[]> {
    const filter: FilterQuery<Comment> = {
      postId,
      isDeleted: false,
      parentCommentId: parentCommentId || null,
    };

    return this.commentModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async exists(commentId: string): Promise<boolean> {
    const count = await this.commentModel.countDocuments({ commentId }).exec();
    return count > 0;
  }

  async countByAuthorId(authorId: string): Promise<number> {
    return this.commentModel
      .countDocuments({ authorId, isDeleted: false })
      .exec();
  }
}
