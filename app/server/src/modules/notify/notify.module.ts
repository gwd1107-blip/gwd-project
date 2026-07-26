/**
 * 文件：server/src/modules/notify/notify.module.ts
 * 职责：通知模块组装
 * 对应设计：docs/02-开发计划.md R6
 */
import { Module } from '@nestjs/common';
import { WecomModule } from '../wecom/wecom.module';
import { NotifyService } from './notify.service';
import { NotifyQueue } from './notify.queue';
import { NotifyController } from './notify.controller';

@Module({
  imports: [WecomModule],
  controllers: [NotifyController],
  providers: [NotifyService, NotifyQueue],
  exports: [NotifyService],
})
export class NotifyModule {}
