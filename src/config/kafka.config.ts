import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  clientId: process.env.KAFKA_CLIENT_ID || 'comment-service',
  groupId: process.env.KAFKA_GROUP_ID || 'comment-service-group',
  topics: {
    comments: 'comments',
    postDeleted: 'post.deleted',
    mentionCreated: 'mention.created',
  },
}));
