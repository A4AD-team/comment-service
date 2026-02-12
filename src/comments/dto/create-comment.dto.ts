import {
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Post ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID for threaded replies',
  })
  @IsUUID()
  @IsOptional()
  parentCommentId?: string;

  @ApiProperty({ description: 'Comment content', maxLength: 4000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content: string;

  @ApiProperty({ description: 'Author ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  authorId: string;
}
