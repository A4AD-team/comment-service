import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Comment } from './schemas/comment.schema';

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

    console.log('Publishing event:', event);
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

    console.log('Publishing event:', event);
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

    console.log('Publishing event:', event);
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

    console.log('Publishing event:', event);
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

    console.log('Publishing event:', event);
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

    console.log('Publishing event:', event);
  }

  async publishCommentsBulkDeleted(
    postId: string,
    count: number,
    requestId?: string,
  ): Promise<void> {
    const event = {
      eventType: 'comments.bulk_deleted',
      postId,
      count,
      timestamp: new Date().toISOString(),
      requestId,
    };

    console.log('Publishing event:', event);
  }
}
