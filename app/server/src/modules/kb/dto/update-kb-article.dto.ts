/**
 * 文件：server/src/modules/kb/dto/update-kb-article.dto.ts
 * 职责：更新知识文章入参
 */
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateKbArticleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
