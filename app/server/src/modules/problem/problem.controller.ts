/**
 * 文件：server/src/modules/problem/problem.controller.ts
 * 职责：问题管理 REST API
 * 对应设计：docs/01-MVP产品设计方案.md 第 4 节
 */
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser, CurrentUserType } from '../auth/current-user.decorator';
import { ProblemService } from './problem.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { AssociateTicketDto } from './dto/associate-ticket.dto';
import { ResolveProblemDto } from './dto/resolve-problem.dto';

@Controller('problems')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Post()
  create(@Body() dto: CreateProblemDto, @CurrentUser() user: CurrentUserType) {
    return this.problemService.create(dto, user.userid);
  }

  @Get()
  list() {
    return this.problemService.list();
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.problemService.detail(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProblemDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.problemService.updateRca(id, dto, user);
  }

  @Post(':id/mark-known-error')
  markKnownError(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserType) {
    return this.problemService.markKnownError(id, user);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolveProblemDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.problemService.resolve(id, dto.finalSolution, user);
  }

  @Post(':id/associate')
  associate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssociateTicketDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.problemService.associateTicket(id, dto, user);
  }
}
