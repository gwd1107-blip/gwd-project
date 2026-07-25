/**
 * 文件：server/src/modules/kb/kb.module.ts
 * 职责：知识库模块组装
 * 对应设计：docs/02-开发计划.md R5
 */
import { Module } from '@nestjs/common';
import { KbService } from './kb.service';
import { KbController } from './kb.controller';

@Module({
  controllers: [KbController],
  providers: [KbService],
  exports: [KbService],
})
export class KbModule {}
