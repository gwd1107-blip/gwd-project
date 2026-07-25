/**
 * 文件：server/src/modules/prisma/prisma.module.ts
 * 职责：Prisma 客户端模块，向全局提供数据库访问
 * 对应设计：docs/02-开发计划.md R0
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
