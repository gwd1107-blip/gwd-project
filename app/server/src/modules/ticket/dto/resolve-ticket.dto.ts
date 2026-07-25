/**
 * 文件：server/src/modules/ticket/dto/resolve-ticket.dto.ts
 * 职责：解决入参校验（解决方案必填，设计 3.6）
 */
import { IsString } from 'class-validator';

export class ResolveTicketDto {
  @IsString()
  solution!: string;
}
