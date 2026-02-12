import { IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Updated comment content', maxLength: 4000 })
  @IsString()
  @MaxLength(4000)
  @IsOptional()
  content?: string;
}
