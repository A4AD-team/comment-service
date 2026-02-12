import { Comment } from '../schemas/comment.schema';

export interface CommentResponse {
  commentId: string;
  postId: string;
  parentCommentId?: string;
  authorId: string;
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

export function mapCommentToResponse(comment: Comment): CommentResponse {
  return {
    commentId: comment.commentId,
    postId: comment.postId,
    parentCommentId: comment.parentCommentId,
    authorId: comment.authorId,
    content: comment.isDeleted ? '[deleted]' : comment.content,
    likesCount: comment.likesCount,
    isDeleted: comment.isDeleted,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}
