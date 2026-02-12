import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import {
  CommentResponse,
  PaginatedCommentsResponse,
} from './interfaces/comment-response.interface';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Headers('x-request-id') requestId?: string,
  ): Promise<CommentResponse> {
    return this.commentsService.create(createCommentDto, requestId);
  }

  @Get()
  @ApiOperation({ summary: 'Get comments with cursor-based pagination' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async findAll(
    @Query() query: GetCommentsQueryDto,
  ): Promise<PaginatedCommentsResponse<CommentResponse>> {
    return this.commentsService.findAll(query);
  }

  @Get(':commentId')
  @ApiOperation({ summary: 'Get a single comment by ID' })
  @ApiResponse({ status: 200, description: 'Comment found' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(
    @Param('commentId') commentId: string,
  ): Promise<CommentResponse> {
    return this.commentsService.findOne(commentId);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the author' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-request-id') requestId?: string,
  ): Promise<CommentResponse> {
    return this.commentsService.update(
      commentId,
      updateCommentDto,
      userId,
      requestId,
    );
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Soft delete a comment' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not the author or moderator',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(
    @Param('commentId') commentId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-is-moderator') isModerator: string = 'false',
    @Headers('x-request-id') requestId?: string,
  ): Promise<void> {
    await this.commentsService.remove(
      commentId,
      userId,
      isModerator === 'true',
      requestId,
    );
  }

  @Post(':commentId/like')
  @ApiOperation({ summary: 'Like a comment' })
  @ApiResponse({ status: 200, description: 'Comment liked successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async like(
    @Param('commentId') commentId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-request-id') requestId?: string,
  ): Promise<CommentResponse> {
    return this.commentsService.like(commentId, userId, requestId);
  }

  @Delete(':commentId/like')
  @ApiOperation({ summary: 'Unlike a comment' })
  @ApiResponse({ status: 200, description: 'Comment unliked successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async unlike(
    @Param('commentId') commentId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-request-id') requestId?: string,
  ): Promise<CommentResponse> {
    return this.commentsService.unlike(commentId, userId, requestId);
  }

  @Post(':commentId/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted comment' })
  @ApiResponse({ status: 200, description: 'Comment restored successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the author' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async restore(
    @Param('commentId') commentId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-request-id') requestId?: string,
  ): Promise<CommentResponse> {
    return this.commentsService.restore(commentId, userId, requestId);
  }
}
