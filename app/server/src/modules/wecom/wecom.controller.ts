/**
 * 文件：server/src/modules/wecom/wecom.controller.ts
 * 职责：企微后台操作入口（如手动同步通讯录）
 * 对应设计：docs/02-开发计划.md R7
 */
import { Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser, CurrentUserType } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { WecomSyncService } from './wecom.sync.service';

@Controller('wecom')
export class WecomController {
  constructor(private readonly syncService: WecomSyncService) {}

  @Post('sync')
  @Roles(UserRole.ADMIN)
  sync(@CurrentUser() user: CurrentUserType) {
    return this.syncService.syncAll();
  }
}
