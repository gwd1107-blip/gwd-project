/**
 * 文件：server/src/modules/health/health.module.ts
 * 职责：健康检查模块组装
 * 对应设计：docs/02-开发计划.md R0
 */
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
