import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Comment } from '../schemas/comment.schema';

export interface CommentEvent {
  eventType: string;
  commentId: string;
  postId: string;
  authorId: string;
  timestamp: string;
  requestId?: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class CommentEventProducer {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    @InjectMetric('comments_created_total')
    private readonly commentsCreatedCounter: Counter<string>,
    @InjectMetric('comments_updated_total')
    private readonly commentsUpdatedCounter: Counter<string>,
    @InjectMetric('comments_deleted_total')
    private readonly commentsDeletedCounter: Counter<string>,
    @InjectMetric('comments_liked_total')
    private readonly commentsLikedCounter: Counter<string>,
    @InjectMetric('comments_unliked_total')
    private readonly commentsUnlikedCounter: Counter<string>,
    @InjectMetric('comment_creation_duration_seconds')
    private readonly creationDurationHistogram: Histogram<string>,
  ) {}

  async publishCommentCreated(
    comment: Comment,
    requestId?: string,
  ): Promise<void> {
    this.commentsCreatedCounter.inc({ postId: comment.postId });

    const event: CommentEvent = {
      eventType: 'comment.created',
      commentId: comment.commentId,
      postId: comment.postId,
      authorId: comment.authorId,
      timestamp: new Date().toISOString(),
      requestId,
      payload: {
        parentCommentId: comment.parentCommentId,
        content: comment.content,
      },
    };

    await this.amqpConnection.publish('comments', 'comment.created', event);
  }

  async publishCommentUpdated(
    comment: Comment,
    requestId?: string,
  ): Promise<void> {
    this.commentsUpdatedCounter.inc({ commentId: comment.commentId });

    const event: CommentEvent = {
      eventType: 'comment.updated',
      commentId: comment.commentId,
      postId: comment.postId,
      authorId: comment.authorId,
      timestamp: new Date().toISOString(),
      requestId,
      payload: {
        content: comment.content,
      },
    };

    await this.amqpConnection.publish('comments', 'comment.updated', event);
  }

  async publishCommentDeleted(
    comment: Comment,
    requestId?: string,
  ): Promise<void> {
    this.commentsDeletedCounter.inc({ commentId: comment.commentId });

    const event: CommentEvent = {
      eventType: 'comment.deleted',
      commentId: comment.commentId,
      postId: comment.postId,
      authorId: comment.authorId,
      timestamp: new Date().toISOString(),
      requestId,
    };

    await this.amqpConnection.publish('comments', 'comment.deleted', event);
  }

  async publishCommentRestored(
    comment: Comment,
    requestId?: string,
  ): Promise<void> {
    const event: CommentEvent = {
      eventType: 'comment.restored',
      commentId: comment.commentId,
      postId: comment.postId,
      authorId: comment.authorId,
      timestamp: new Date().toISOString(),
      requestId,
    };

    await this.amqpConnection.publish('comments', 'comment.restored', event);
  }

  async publishCommentLiked(
    comment: Comment,
    userId: string,
    requestId?: string,
  ): Promise<void> {
    this.commentsLikedCounter.inc({ commentId: comment.commentId });

    const event: CommentEvent = {
      eventType: 'comment.liked',
      commentId: comment.commentId,
      postId: comment.postId,
      authorId: comment.authorId,
      timestamp: new Date().toISOString(),
      requestId,
      payload: {
        likedBy: userId,
        likesCount: comment.likesCount,
      },
    };

    await this.amqpConnection.publish('comments', 'comment.liked', event);
  }

  async publishCommentUnliked(
    comment: Comment,
    userId: string,
    requestId?: string,
  ): Promise<void> {
    this.commentsUnlikedCounter.inc({ commentId: comment.commentId });

    const event: CommentEvent = {
      eventType: 'comment.unliked',
      commentId: comment.commentId,
      postId: comment.postId,
      authorId: comment.authorId,
      timestamp: new Date().toISOString(),
      requestId,
      payload: {
        unlikedBy: userId,
        likesCount: comment.likesCount,
      },
    };

    await this.amqpConnection.publish('comments', 'comment.unliked', event);
  }

  async publishCommentsBulkDeleted(
    postId: string,
    count: number,
    requestId?: string,
  ): Promise<void> {
    const event: CommentEvent = {
      eventType: 'comments.bulk_deleted',
      commentId: '',
      postId,
      authorId: '',
      timestamp: new Date().toISOString(),
      requestId,
      payload: { count },
    };

    await this.amqpConnection.publish(
      'comments',
      'comments.bulk_deleted',
      event,
    );
  }
}
