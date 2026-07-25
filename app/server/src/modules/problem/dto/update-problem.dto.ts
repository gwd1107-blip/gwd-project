/**
 * 文件：server/src/modules/problem/dto/update-problem.dto.ts
 * 职责：更新 RCA 字段/状态入参
 */
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProblemStatus } from '@prisma/client';

export class UpdateProblemDto {
  @IsOptional()
  @IsString()
  symptom?: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  workaround?: string;

  @IsOptional()
  @IsString()
  finalSolution?: string;

  @IsOptional()
  @IsEnum(ProblemStatus)
  status?: ProblemStatus;

  @IsOptional()
  @IsBoolean()
  isKnownError?: boolean;
}
