import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LikeCommentDto {
  @ApiProperty({ description: 'User ID who likes the comment' })
  @IsUUID()
  userId: string;
}
