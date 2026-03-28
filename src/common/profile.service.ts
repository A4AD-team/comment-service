import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProfileServiceClient {
  private readonly logger = new Logger(ProfileServiceClient.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PROFILE_SERVICE_URL || 'http://profile-service:8082';
  }

  async getUsernameById(authorId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/internal/profiles/by-author/${authorId}`, {
        headers: { 'X-Internal-Secret': process.env.INTERNAL_SECRET || 'a4ad-internal-secret' }
      });
      return response.data?.username || 'Unknown';
    } catch (error) {
      this.logger.warn(`Failed to get username for author ${authorId}: ${error}`);
      return 'Unknown';
    }
  }

  async getUsernamesByAuthorIds(authorIds: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    const promises = authorIds.map(async (authorId) => {
      const username = await this.getUsernameById(authorId);
      result.set(authorId, username);
    });
    await Promise.all(promises);
    return result;
  }
}
