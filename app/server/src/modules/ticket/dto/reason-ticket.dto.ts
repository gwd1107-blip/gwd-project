/**
 * 文件：server/src/modules/ticket/dto/reason-ticket.dto.ts
 * 职责：挂起/取消/打回的原因入参校验
 */
import { IsString } from 'class-validator';

export class ReasonTicketDto {
  @IsString()
  reason!: string;
}
