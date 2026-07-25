/**
 * 文件：server/src/modules/health/health.controller.ts
 * 职责：服务健康检查，返回数据库连通状态
 * 对应设计：docs/02-开发计划.md R0
 */
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    // 通过原始查询验证 PG 连通；无需真实表存在
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
