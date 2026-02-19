import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repository';
import { CommentEventProducer } from './events/comment.events';
import {
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { RabbitMQModuleConfig } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    RabbitMQModuleConfig,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRepository,
    CommentEventProducer,
    makeCounterProvider({
      name: 'comments_created_total',
      help: 'Total number of comments created',
      labelNames: ['postId'],
    }),
    makeCounterProvider({
      name: 'comments_updated_total',
      help: 'Total number of comments updated',
      labelNames: ['commentId'],
    }),
    makeCounterProvider({
      name: 'comments_deleted_total',
      help: 'Total number of comments deleted',
      labelNames: ['commentId'],
    }),
    makeCounterProvider({
      name: 'comments_liked_total',
      help: 'Total number of comment likes',
      labelNames: ['commentId'],
    }),
    makeCounterProvider({
      name: 'comments_unliked_total',
      help: 'Total number of comment unlikes',
      labelNames: ['commentId'],
    }),
    makeHistogramProvider({
      name: 'comment_creation_duration_seconds',
      help: 'Duration of comment creation in seconds',
      labelNames: ['postId'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    }),
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
