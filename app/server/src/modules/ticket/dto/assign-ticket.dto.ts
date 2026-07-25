/**
 * 文件：server/src/modules/ticket/dto/assign-ticket.dto.ts
 * 职责：接单/指派入参校验（含影响面，用于计算优先级）
 */
import { IsEnum, IsString } from 'class-validator';
import { Impact } from '@prisma/client';

export class AssignTicketDto {
  @IsString()
  agentUserid!: string;

  @IsEnum(Impact)
  impact!: Impact;
}
