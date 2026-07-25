/**
 * 文件：server/src/modules/ticket/ticket.controller.ts
 * 职责：工单 REST API
 * 对应设计：docs/01-MVP产品设计方案.md 第 3 节
 */
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CurrentUser, CurrentUserType } from '../auth/current-user.decorator';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { ResolveTicketDto } from './dto/resolve-ticket.dto';
import { ReasonTicketDto } from './dto/reason-ticket.dto';
import { TransferTicketDto } from './dto/transfer-ticket.dto';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: CurrentUserType) {
    return this.ticketService.create(dto, user.userid);
  }

  @Get()
  list(@CurrentUser() user: CurrentUserType) {
    return this.ticketService.list(user);
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.detail(id);
  }

  @Post(':id/assign')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignTicketDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.ticketService.assign(id, dto, user);
  }

  @Post(':id/reply')
  reply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyTicketDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.ticketService.reply(id, dto, user);
  }

  @Post(':id/suspend')
  suspend(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReasonTicketDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.ticketService.suspend(id, dto, user);
  }

  @Post(':id/resume')
  resume(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserType) {
    return this.ticketService.resume(id, user);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolveTicketDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.ticketService.resolve(id, dto, user);
  }

  @Post(':id/close')
  close(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserType) {
    return this.ticketService.close(id, user);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReasonTicketDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.ticketService.cancel(id, dto, user);
  }

  @Post(':id/transfer')
  transfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransferTicketDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.ticketService.transfer(id, dto, user);
  }

  @Post(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReasonTicketDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.ticketService.reject(id, dto, user);
  }
}
