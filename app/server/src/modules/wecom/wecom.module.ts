/**
 * 文件：server/src/modules/wecom/wecom.module.ts
 * 职责：企微对接模块组装
 * 对应设计：docs/02-开发计划.md R7
 */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { WecomApiService } from './wecom.api.service';
import { WecomSyncService } from './wecom.sync.service';
import { WecomMessageService } from './wecom.message.service';
import { WecomAuthController } from './wecom.auth.controller';
import { WecomCallbackController } from './wecom.callback.controller';
import { WecomController } from './wecom.controller';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [WecomAuthController, WecomCallbackController, WecomController],
  providers: [WecomApiService, WecomSyncService, WecomMessageService],
  exports: [WecomMessageService],
})
export class WecomModule {}
