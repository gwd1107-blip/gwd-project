/**
 * 文件：server/src/modules/ticket/dto/reply-ticket.dto.ts
 * 职责：回复入参校验
 */
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ReplyTicketDto {
  @IsString()
  comment!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
