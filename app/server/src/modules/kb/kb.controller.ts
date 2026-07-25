/**
 * 文件：server/src/modules/kb/kb.controller.ts
 * 职责：知识库 REST API
 * 对应设计：docs/01-MVP产品设计方案.md 第 5 节
 */
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, CurrentUserType } from '../auth/current-user.decorator';
import { KbService } from './kb.service';
import { CreateKbArticleDto } from './dto/create-kb-article.dto';
import { UpdateKbArticleDto } from './dto/update-kb-article.dto';

@Controller('kb/articles')
export class KbController {
  constructor(private readonly kbService: KbService) {}

  @Post()
  create(@Body() dto: CreateKbArticleDto, @CurrentUser() user: CurrentUserType) {
    return this.kbService.create(dto, user.userid);
  }

  @Get()
  list() {
    return this.kbService.listPublished();
  }

  @Get('drafts')
  drafts() {
    return this.kbService.listDrafts();
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.kbService.search(q);
  }

  @Get('recommend')
  recommend(@Query('q') q: string) {
    return this.kbService.recommend(q);
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.kbService.detail(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateKbArticleDto) {
    return this.kbService.update(id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.kbService.publish(id);
  }

  @Post(':id/like')
  like(@Param('id', ParseIntPipe) id: number) {
    return this.kbService.like(id);
  }

  @Post(':id/dislike')
  dislike(@Param('id', ParseIntPipe) id: number) {
    return this.kbService.dislike(id);
  }
}
