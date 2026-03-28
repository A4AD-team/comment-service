import {
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Post ID (UUID or numeric string)' })
  @IsString()
  @IsNotEmpty()
  postId: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID for threaded replies',
  })
  @IsString()
  @IsOptional()
  parentCommentId?: string;

  @ApiProperty({ description: 'Comment content', maxLength: 4000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content: string;

  @ApiPropertyOptional({ description: 'Author ID (optional, will be taken from JWT if not provided)' })
  @IsString()
  @IsOptional()
  authorId?: string;

  @ApiPropertyOptional({ description: 'Author username (optional, will be taken from JWT if not provided)' })
  @IsString()
  @IsOptional()
  authorUsername?: string;
}
