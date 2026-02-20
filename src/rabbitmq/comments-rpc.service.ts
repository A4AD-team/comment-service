import { Injectable, Logger, HttpException } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { UpdateCommentDto } from '../comments/dto/update-comment.dto';
import { GetCommentsQueryDto } from '../comments/dto/get-comments-query.dto';
import {
  CommentResponse,
  PaginatedCommentsResponse,
} from '../comments/interfaces/comment-response.interface';

export interface RpcRequest {
  requestId?: string;
  timestamp: string;
}

export interface CreateCommentRequest extends RpcRequest {
  postId: string;
  parentCommentId?: string;
  content: string;
  authorId: string;
}

export interface GetCommentsRequest extends RpcRequest {
  postId: string;
  cursor?: string;
  limit?: number;
  sort?: 'asc' | 'desc';
}

export interface GetCommentRequest extends RpcRequest {
  commentId: string;
}

export interface UpdateCommentRequest extends RpcRequest {
  commentId: string;
  content?: string;
  userId: string;
}

export interface DeleteCommentRequest extends RpcRequest {
  commentId: string;
  userId: string;
  isModerator?: boolean;
}

export interface LikeCommentRequest extends RpcRequest {
  commentId: string;
  userId: string;
}

export interface RestoreCommentRequest extends RpcRequest {
  commentId: string;
  userId: string;
}

export interface RpcResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  requestId?: string;
}

function getErrorCode(error: unknown): string {
  if (error instanceof HttpException) {
    return error.name;
  }
  if (typeof error === 'object' && error !== null && 'name' in error) {
    return String((error as { name: unknown }).name);
  }
  return 'INTERNAL_ERROR';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unknown error';
}

@Injectable()
export class CommentsRpcService {
  private readonly logger = new Logger(CommentsRpcService.name);

  constructor(
    private readonly commentsService: CommentsService,
    @InjectMetric('comment_rpc_duration_seconds')
    private readonly rpcDurationHistogram: Histogram<string>,
  ) {}

  async createComment(
    request: CreateCommentRequest,
  ): Promise<RpcResponse<CommentResponse>> {
    const labels = { operation: 'create' };
    const end = this.rpcDurationHistogram.startTimer(labels);

    try {
      const dto: CreateCommentDto = {
        postId: request.postId,
        parentCommentId: request.parentCommentId,
        content: request.content,
        authorId: request.authorId,
      };

      const result = await this.commentsService.create(dto, request.requestId);
      end();

      return {
        success: true,
        data: result,
        requestId: request.requestId,
      };
    } catch (error) {
      end();
      const message = getErrorMessage(error);
      this.logger.error(
        `Failed to create comment: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: {
          code: getErrorCode(error),
          message,
        },
        requestId: request.requestId,
      };
    }
  }

  async getComments(
    request: GetCommentsRequest,
  ): Promise<RpcResponse<PaginatedCommentsResponse<CommentResponse>>> {
    const labels = { operation: 'getComments' };
    const end = this.rpcDurationHistogram.startTimer(labels);

    try {
      const query: GetCommentsQueryDto = {
        postId: request.postId,
        cursor: request.cursor,
        limit: request.limit,
        sort: request.sort,
      };

      const result = await this.commentsService.findAll(query);
      end();

      return {
        success: true,
        data: result,
        requestId: request.requestId,
      };
    } catch (error) {
      end();
      const message = getErrorMessage(error);
      this.logger.error(
        `Failed to get comments: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: {
          code: getErrorCode(error),
          message,
        },
        requestId: request.requestId,
      };
    }
  }

  async getComment(
    request: GetCommentRequest,
  ): Promise<RpcResponse<CommentResponse>> {
    const labels = { operation: 'getComment' };
    const end = this.rpcDurationHistogram.startTimer(labels);

    try {
      const result = await this.commentsService.findOne(request.commentId);
      end();

      return {
        success: true,
        data: result,
        requestId: request.requestId,
      };
    } catch (error) {
      end();
      const message = getErrorMessage(error);
      this.logger.error(
        `Failed to get comment: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: {
          code: getErrorCode(error),
          message,
        },
        requestId: request.requestId,
      };
    }
  }

  async updateComment(
    request: UpdateCommentRequest,
  ): Promise<RpcResponse<CommentResponse>> {
    const labels = { operation: 'update' };
    const end = this.rpcDurationHistogram.startTimer(labels);

    try {
      const dto: UpdateCommentDto = {};
      if (request.content !== undefined) {
        dto.content = request.content;
      }

      const result = await this.commentsService.update(
        request.commentId,
        dto,
        request.userId,
        request.requestId,
      );
      end();

      return {
        success: true,
        data: result,
        requestId: request.requestId,
      };
    } catch (error) {
      end();
      const message = getErrorMessage(error);
      this.logger.error(
        `Failed to update comment: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: {
          code: getErrorCode(error),
          message,
        },
        requestId: request.requestId,
      };
    }
  }

  async deleteComment(
    request: DeleteCommentRequest,
  ): Promise<RpcResponse<void>> {
    const labels = { operation: 'delete' };
    const end = this.rpcDurationHistogram.startTimer(labels);

    try {
      await this.commentsService.remove(
        request.commentId,
        request.userId,
        request.isModerator || false,
        request.requestId,
      );
      end();

      return {
        success: true,
        requestId: request.requestId,
      };
    } catch (error) {
      end();
      const message = getErrorMessage(error);
      this.logger.error(
        `Failed to delete comment: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: {
          code: getErrorCode(error),
          message,
        },
        requestId: request.requestId,
      };
    }
  }

  async likeComment(
    request: LikeCommentRequest,
  ): Promise<RpcResponse<CommentResponse>> {
    const labels = { operation: 'like' };
    const end = this.rpcDurationHistogram.startTimer(labels);

    try {
      const result = await this.commentsService.like(
        request.commentId,
        request.userId,
        request.requestId,
      );
      end();

      return {
        success: true,
        data: result,
        requestId: request.requestId,
      };
    } catch (error) {
      end();
      const message = getErrorMessage(error);
      this.logger.error(
        `Failed to like comment: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: {
          code: getErrorCode(error),
          message,
        },
        requestId: request.requestId,
      };
    }
  }

  async unlikeComment(
    request: LikeCommentRequest,
  ): Promise<RpcResponse<CommentResponse>> {
    const labels = { operation: 'unlike' };
    const end = this.rpcDurationHistogram.startTimer(labels);

    try {
      const result = await this.commentsService.unlike(
        request.commentId,
        request.userId,
        request.requestId,
      );
      end();

      return {
        success: true,
        data: result,
        requestId: request.requestId,
      };
    } catch (error) {
      end();
      const message = getErrorMessage(error);
      this.logger.error(
        `Failed to unlike comment: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: {
          code: getErrorCode(error),
          message,
        },
        requestId: request.requestId,
      };
    }
  }

  async restoreComment(
    request: RestoreCommentRequest,
  ): Promise<RpcResponse<CommentResponse>> {
    const labels = { operation: 'restore' };
    const end = this.rpcDurationHistogram.startTimer(labels);

    try {
      const result = await this.commentsService.restore(
        request.commentId,
        request.userId,
        request.requestId,
      );
      end();

      return {
        success: true,
        data: result,
        requestId: request.requestId,
      };
    } catch (error) {
      end();
      const message = getErrorMessage(error);
      this.logger.error(
        `Failed to restore comment: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: {
          code: getErrorCode(error),
          message,
        },
        requestId: request.requestId,
      };
    }
  }
}
