/**
 * 文件：server/src/modules/problem/dto/associate-ticket.dto.ts
 * 职责：关联事件入参
 */
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class AssociateTicketDto {
  @IsInt()
  ticketId!: number;

  @IsOptional()
  @IsBoolean()
  meToo?: boolean;
}
