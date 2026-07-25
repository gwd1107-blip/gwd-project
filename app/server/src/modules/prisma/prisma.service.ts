/**
 * 文件：server/src/modules/prisma/prisma.service.ts
 * 职责：PrismaClient 生命周期管理（启动连接/关闭断开）
 * 对应设计：docs/02-开发计划.md R0
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
