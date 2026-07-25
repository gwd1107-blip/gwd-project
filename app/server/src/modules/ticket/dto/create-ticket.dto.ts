/**
 * 文件：server/src/modules/ticket/dto/create-ticket.dto.ts
 * 职责：提单入参校验
 * 对应设计：docs/01-MVP产品设计方案.md 第 3.2 节
 */
import { IsEnum, IsInt, IsOptional, IsString, IsArray } from 'class-validator';
import { Urgency } from '@prisma/client';

export class CreateTicketDto {
  @IsInt()
  categoryId!: number;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(Urgency)
  urgency!: Urgency;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsString()
  substituteUserid?: string;
}
