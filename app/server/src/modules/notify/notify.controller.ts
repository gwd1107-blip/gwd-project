/**
 * 文件：server/src/modules/notify/notify.controller.ts
 * 职责：站内通知 API
 * 对应设计：docs/02-开发计划.md R6
 */
import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CurrentUser, CurrentUserType } from '../auth/current-user.decorator';
import { NotifyService } from './notify.service';

@Controller('notifications')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserType) {
    return this.notifyService.listForUser(user.userid);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: CurrentUserType) {
    return this.notifyService.unreadCount(user.userid);
  }

  @Post(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserType) {
    return this.notifyService.markRead(id, user.userid);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: CurrentUserType) {
    return this.notifyService.markAllRead(user.userid);
  }
}
