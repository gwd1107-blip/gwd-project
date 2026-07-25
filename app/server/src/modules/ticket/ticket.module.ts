/**
 * 文件：server/src/modules/ticket/ticket.module.ts
 * 职责：工单模块组装
 * 对应设计：docs/02-开发计划.md R2
 */
import { Module } from '@nestjs/common';
import { KbModule } from '../kb/kb.module';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';

@Module({
  imports: [KbModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
