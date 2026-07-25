/**
 * 文件：server/src/modules/kb/dto/create-kb-article.dto.ts
 * 职责：创建知识文章入参
 */
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateKbArticleDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsInt()
  categoryId!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
