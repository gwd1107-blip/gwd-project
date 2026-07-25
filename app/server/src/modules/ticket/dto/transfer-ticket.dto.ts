/**
 * 文件：server/src/modules/ticket/dto/transfer-ticket.dto.ts
 * 职责：转交入参校验
 */
import { IsString } from 'class-validator';

export class TransferTicketDto {
  @IsString()
  agentUserid!: string;
}
