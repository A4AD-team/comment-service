import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PostServiceClient {
  private readonly logger = new Logger(PostServiceClient.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.POST_SERVICE_URL || 'http://localhost:8083/api/v1';
  }

  async incrementCommentCount(postId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/posts/${postId}/comments/increment`);
    } catch (error) {
      this.logger.error(`Failed to increment comment count for post ${postId}: ${error}`);
    }
  }

  async decrementCommentCount(postId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/posts/${postId}/comments/decrement`);
    } catch (error) {
      this.logger.error(`Failed to decrement comment count for post ${postId}: ${error}`);
    }
  }
}
