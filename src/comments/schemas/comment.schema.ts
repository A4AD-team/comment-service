import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, unique: true, index: true })
  commentId: string;

  @Prop({ required: true, index: true })
  postId: string;

  @Prop({ index: true })
  parentCommentId?: string;

  @Prop({ required: true, index: true })
  authorId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  deletedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Create compound indexes
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ postId: 1, parentCommentId: 1 });
