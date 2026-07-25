/**
 * 文件：server/src/modules/category/category.module.ts
 * 职责：分类模块组装
 * 对应设计：docs/01-MVP产品设计方案.md 第 3.4 节
 */
import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';

@Module({
  controllers: [CategoryController],
})
export class CategoryModule {}
