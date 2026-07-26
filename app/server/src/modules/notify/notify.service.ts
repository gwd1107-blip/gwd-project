/**
 * 文件：server/src/modules/notify/notify.service.ts
 * 职责：通知模型、模板渲染、发送记录
 * 对应设计：docs/01-MVP产品设计方案.md 第 2.2 节
 */
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotifyQueue } from './notify.queue';

export interface NotifyInput {
  type: NotificationType;
  recipientUserid: string;
  context: Record<string, any>;
}

@Injectable()
export class NotifyService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotifyQueue)) private readonly queue: NotifyQueue,
  ) {}

  /** 创建通知并入队 */
  async notify(input: NotifyInput) {
    const { title, content } = this.render(input.type, input.context);
    const notification = await this.prisma.notification.create({
      data: {
        type: input.type,
        title,
        content,
        payload: input.context,
        recipientUserid: input.recipientUserid,
      },
    });
    await this.queue.enqueue(notification.id);
    return notification;
  }

  /** 用户通知列表 */
  async listForUser(userid: string) {
    return this.prisma.notification.findMany({
      where: { recipientUserid: userid },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /** 未读数 */
  async unreadCount(userid: string) {
    return this.prisma.notification.count({
      where: { recipientUserid: userid, read: false },
    });
  }

  /** 标记已读 */
  async markRead(id: number, userid: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('通知不存在');
    if (n.recipientUserid !== userid) throw new NotFoundException('通知不存在');
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  /** 全部已读 */
  async markAllRead(userid: string) {
    await this.prisma.notification.updateMany({
      where: { recipientUserid: userid, read: false },
      data: { read: true },
    });
    return { ok: true };
  }

  /** 实际发送（R6 站内模拟，R7 替换为企微消息） */
  async sendOne(id: number) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('通知不存在');
    if (n.status === NotificationStatus.SENT) return n;

    // 模拟发送成功；R7 时这里调用企微消息 API
    console.log(`[notify] sent to ${n.recipientUserid}: ${n.title}`);
    return this.prisma.notification.update({
      where: { id },
      data: { status: NotificationStatus.SENT, lastError: null },
    });
  }

  /** 发送失败，重试计数 +1 */
  async markFailed(id: number, error: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) return;
    const retryCount = n.retryCount + 1;
    const status = retryCount >= 3 ? NotificationStatus.FAILED : NotificationStatus.PENDING;
    return this.prisma.notification.update({
      where: { id },
      data: { retryCount, lastError: error, status },
    });
  }

  /** 模板渲染 */
  private render(type: NotificationType, ctx: Record<string, any>) {
    const templates: Record<NotificationType, { title: string; content: string }> = {
      ASSIGN: {
        title: `工单 ${ctx.ticketNo} 已指派给你`,
        content: `工单「${ctx.title}」已指派给你，请及时处理。`,
      },
      STATUS_CHANGE: {
        title: `工单 ${ctx.ticketNo} 状态更新`,
        content: `工单「${ctx.title}」状态变为 ${ctx.statusText}。`,
      },
      TIMEOUT: {
        title: `工单 ${ctx.ticketNo} 已超时`,
        content: `工单「${ctx.title}」已超时，请尽快处理。`,
      },
      REMINDER: {
        title: `工单 ${ctx.ticketNo} 催办`,
        content: `工单「${ctx.title}」等待你处理，请尽快跟进。`,
      },
    };
    return templates[type];
  }
}
