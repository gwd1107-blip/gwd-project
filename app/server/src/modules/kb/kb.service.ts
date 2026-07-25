/**
 * 文件：server/src/modules/kb/kb.service.ts
 * 职责：知识库 CRUD、搜索、推荐、沉淀
 * 对应设计：docs/01-MVP产品设计方案.md 第 5 节
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { KbArticleSource, KbArticleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKbArticleDto } from './dto/create-kb-article.dto';
import { UpdateKbArticleDto } from './dto/update-kb-article.dto';

@Injectable()
export class KbService {
  constructor(private readonly prisma: PrismaService) {}

  /** 手动创建（默认草稿） */
  async create(dto: CreateKbArticleDto, authorUserid: string) {
    return this.prisma.kbArticle.create({
      data: {
        title: dto.title,
        content: dto.content,
        categoryId: dto.categoryId,
        tags: dto.tags ?? [],
        sourceType: KbArticleSource.MANUAL,
      },
      include: { category: true },
    });
  }

  /** 更新 */
  async update(id: number, dto: UpdateKbArticleDto) {
    await this.findById(id);
    return this.prisma.kbArticle.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        content: dto.content ?? undefined,
        categoryId: dto.categoryId ?? undefined,
        tags: dto.tags ?? undefined,
      },
      include: { category: true },
    });
  }

  /** 发布 */
  async publish(id: number) {
    await this.findById(id);
    return this.prisma.kbArticle.update({
      where: { id },
      data: { status: KbArticleStatus.PUBLISHED },
      include: { category: true },
    });
  }

  /** 已发布列表 */
  async listPublished() {
    return this.prisma.kbArticle.findMany({
      where: { status: KbArticleStatus.PUBLISHED },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** 草稿列表（供技术员/管理员查看） */
  async listDrafts() {
    return this.prisma.kbArticle.findMany({
      where: { status: KbArticleStatus.DRAFT },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** 详情（浏览量 +1） */
  async detail(id: number) {
    const article = await this.prisma.kbArticle.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!article) throw new NotFoundException('文章不存在');
    await this.prisma.kbArticle.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return article;
  }

  /** 搜索（PG contains 实现，中文分词后续可换 zhparser） */
  async search(q: string) {
    return this.prisma.kbArticle.findMany({
      where: {
        status: KbArticleStatus.PUBLISHED,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { category: true },
      orderBy: { likes: 'desc' },
      take: 20,
    });
  }

  /** 提单推荐：文章 + 已知错误 */
  async recommend(q: string) {
    const articles = await this.prisma.kbArticle.findMany({
      where: {
        status: KbArticleStatus.PUBLISHED,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { category: true },
      orderBy: { likes: 'desc' },
      take: 3,
    });

    const knownErrors = await this.prisma.problem.findMany({
      where: {
        isKnownError: true,
        workaround: { not: null },
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { symptom: { contains: q, mode: 'insensitive' } },
          { rootCause: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });

    return { articles, knownErrors };
  }

  /** 点赞 */
  async like(id: number) {
    await this.findById(id);
    return this.prisma.kbArticle.update({
      where: { id },
      data: { likes: { increment: 1 } },
      include: { category: true },
    });
  }

  /** 点踩 */
  async dislike(id: number) {
    await this.findById(id);
    return this.prisma.kbArticle.update({
      where: { id },
      data: { dislikes: { increment: 1 } },
      include: { category: true },
    });
  }

  /** 从工单沉淀（关单时把解决方案转为草稿） */
  async createFromTicket(ticket: { id: number; title: string; solution: string | null; categoryId: number }) {
    if (!ticket.solution) return null;
    return this.prisma.kbArticle.create({
      data: {
        title: `[工单] ${ticket.title}`,
        content: ticket.solution,
        categoryId: ticket.categoryId,
        sourceType: KbArticleSource.TICKET,
        sourceId: ticket.id,
      },
    });
  }

  /** 从问题沉淀（发布临时方案或最终方案） */
  async publishFromProblem(problem: { id: number; title: string; workaround: string | null; finalSolution: string | null; categoryId: number }) {
    const content = problem.finalSolution ?? problem.workaround;
    if (!content) return null;
    return this.prisma.kbArticle.create({
      data: {
        title: `[问题] ${problem.title}`,
        content,
        categoryId: problem.categoryId,
        sourceType: KbArticleSource.PROBLEM,
        sourceId: problem.id,
        status: KbArticleStatus.PUBLISHED,
      },
    });
  }

  private async findById(id: number) {
    const article = await this.prisma.kbArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('文章不存在');
    return article;
  }
}
