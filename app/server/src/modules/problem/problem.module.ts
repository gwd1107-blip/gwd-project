/**
 * 文件：server/src/modules/problem/problem.module.ts
 * 职责：问题管理模块组装
 * 对应设计：docs/02-开发计划.md R4
 */
import { Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';

@Module({
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
