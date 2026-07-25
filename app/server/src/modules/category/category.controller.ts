/**
 * 文件：server/src/modules/category/category.controller.ts
 * 职责：预置分类查询（两级树，供前端级联选择）
 * 对应设计：docs/01-MVP产品设计方案.md 第 3.4 节
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async tree() {
    const all = await this.prisma.category.findMany({
      where: { enabled: true },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
    });

    const roots = all.filter((c) => c.parentId === null);
    return roots.map((r) => ({
      ...r,
      children: all.filter((c) => c.parentId === r.id),
    }));
  }
}
