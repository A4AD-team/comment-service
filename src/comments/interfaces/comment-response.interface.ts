import { Comment } from '../schemas/comment.schema';

export interface CommentResponse {
  commentId: string;
  postId: string;
  parentCommentId?: string;
  authorId: string;
  authorUsername: string;
  content: string;
  likesCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedCommentsResponse<T> {
  items: T[];
  nextCursor?: string;
  prevCursor?: string;
  totalCount: number;
}

// Extend Comment type to include Mongoose timestamps
interface CommentWithTimestamps extends Comment {
  createdAt: Date;
  updatedAt: Date;
}

export function mapCommentToResponse(comment: Comment, authorUsername?: string): CommentResponse {
  const commentWithTimestamps = comment as CommentWithTimestamps;
  const displayUsername = authorUsername || comment.authorUsername || 'Unknown';
  return {
    commentId: comment.commentId,
    postId: comment.postId,
    parentCommentId: comment.parentCommentId,
    authorId: comment.authorId,
    authorUsername: displayUsername,
    content: comment.isDeleted ? '[deleted]' : comment.content,
    likesCount: comment.likesCount,
    isDeleted: comment.isDeleted,
    createdAt: commentWithTimestamps.createdAt,
    updatedAt: commentWithTimestamps.updatedAt,
  };
}
