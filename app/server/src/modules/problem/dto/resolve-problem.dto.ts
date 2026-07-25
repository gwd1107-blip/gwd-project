/**
 * 文件：server/src/modules/problem/dto/resolve-problem.dto.ts
 * 职责：解决问题入参
 */
import { IsString } from 'class-validator';

export class ResolveProblemDto {
  @IsString()
  finalSolution!: string;
}
