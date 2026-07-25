/**
 * 文件：server/src/modules/problem/dto/create-problem.dto.ts
 * 职责：创建问题入参
 */
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProblemDto {
  @IsString()
  title!: string;

  @IsString()
  symptom!: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  workaround?: string;

  @IsOptional()
  @IsInt()
  ticketId?: number;
}
