import { Controller } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { CommentsRpcService } from './comments-rpc.service';
import type {
  CreateCommentRequest,
  GetCommentsRequest,
  GetCommentRequest,
  UpdateCommentRequest,
  DeleteCommentRequest,
  LikeCommentRequest,
  RestoreCommentRequest,
} from './comments-rpc.service';

@Controller()
export class CommentsRpcController {
  constructor(private readonly commentsRpcService: CommentsRpcService) {}

  @RabbitRPC({
    exchange: 'comments',
    routingKey: 'comment.create',
    queue: 'comments.rpc.create',
  })
  async createComment(request: CreateCommentRequest) {
    return this.commentsRpcService.createComment(request);
  }

  @RabbitRPC({
    exchange: 'comments',
    routingKey: 'comment.getAll',
    queue: 'comments.rpc.getAll',
  })
  async getComments(request: GetCommentsRequest) {
    return this.commentsRpcService.getComments(request);
  }

  @RabbitRPC({
    exchange: 'comments',
    routingKey: 'comment.get',
    queue: 'comments.rpc.get',
  })
  async getComment(request: GetCommentRequest) {
    return this.commentsRpcService.getComment(request);
  }

  @RabbitRPC({
    exchange: 'comments',
    routingKey: 'comment.update',
    queue: 'comments.rpc.update',
  })
  async updateComment(request: UpdateCommentRequest) {
    return this.commentsRpcService.updateComment(request);
  }

  @RabbitRPC({
    exchange: 'comments',
    routingKey: 'comment.delete',
    queue: 'comments.rpc.delete',
  })
  async deleteComment(request: DeleteCommentRequest) {
    return this.commentsRpcService.deleteComment(request);
  }

  @RabbitRPC({
    exchange: 'comments',
    routingKey: 'comment.like',
    queue: 'comments.rpc.like',
  })
  async likeComment(request: LikeCommentRequest) {
    return this.commentsRpcService.likeComment(request);
  }

  @RabbitRPC({
    exchange: 'comments',
    routingKey: 'comment.unlike',
    queue: 'comments.rpc.unlike',
  })
  async unlikeComment(request: LikeCommentRequest) {
    return this.commentsRpcService.unlikeComment(request);
  }

  @RabbitRPC({
    exchange: 'comments',
    routingKey: 'comment.restore',
    queue: 'comments.rpc.restore',
  })
  async restoreComment(request: RestoreCommentRequest) {
    return this.commentsRpcService.restoreComment(request);
  }
}
