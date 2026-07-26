/**
 * 文件：server/src/modules/notify/notify.queue.ts
 * 职责：Redis 队列消费通知，失败自动重试 3 次入死信
 * 对应设计：docs/02-开发计划.md R6
 */
import { forwardRef, Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { NotificationStatus } from '@prisma/client';
import { NotifyService } from './notify.service';

@Injectable()
export class NotifyQueue implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private timer?: NodeJS.Timeout;

  constructor(@Inject(forwardRef(() => NotifyService)) private readonly notifyService: NotifyService) {
    this.client = createClient({
      url: process.env.REDIS_URL ?? 'redis://redis:6379',
    });
  }

  async onModuleInit() {
    await this.client.connect();
    this.timer = setInterval(() => this.process(), 1000);
  }

  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.client.quit();
  }

  /** 将通知 ID 入队 */
  async enqueue(id: number) {
    await this.client.lPush('notify:queue', String(id));
  }

  private async process() {
    const id = await this.client.rPop('notify:queue');
    if (!id) return;

    try {
      await this.notifyService.sendOne(Number(id));
    } catch (e: any) {
      const msg = e?.message ?? 'unknown error';
      const failed = await this.notifyService.markFailed(Number(id), msg);
      // 未达 3 次则重新入队
      if (failed && failed.status === NotificationStatus.PENDING) {
        await this.enqueue(Number(id));
      }
    }
  }
}
