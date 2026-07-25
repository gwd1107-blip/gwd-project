/**
 * 文件：server/src/modules/ticket/ticket.service.ts
 * 职责：工单核心业务逻辑（提单/接单/处理/解决/关闭）
 * 对应设计：docs/01-MVP产品设计方案.md 第 3 节
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Impact, Priority, TicketEventAction, TicketStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KbService } from '../kb/kb.service';
import { assertTransitionAllowed } from './ticket.state-machine';
import { computeDeadlines, computePriority } from './ticket.policy';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { ResolveTicketDto } from './dto/resolve-ticket.dto';
import { ReasonTicketDto } from './dto/reason-ticket.dto';
import { TransferTicketDto } from './dto/transfer-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kbService: KbService,
  ) {}

  /** 提单：创建时只记录紧急程度，优先级在接单时计算（设计 3.5） */
  async create(dto: CreateTicketDto, requesterUserid: string) {
    const ticketNo = await this.generateTicketNo();
    const ticket = await this.prisma.ticket.create({
      data: {
        ticketNo,
        title: dto.title,
        description: dto.description,
        attachments: dto.attachments ?? [],
        categoryId: dto.categoryId,
        urgency: dto.urgency,
        requesterUserid,
        substituteUserid: dto.substituteUserid,
      },
      include: { category: true, events: true },
    });
    await this.recordEvent(ticket.id, requesterUserid, TicketEventAction.CREATE, null, null, null);
    return ticket;
  }

  /** 接单/指派：设置技术员、计算优先级与时限（设计 3.5） */
  async assign(id: number, dto: AssignTicketDto, actor: { userid: string; role: UserRole }) {
    this.assertTechOrAdmin(actor.role);
    const ticket = await this.findById(id);

    assertTransitionAllowed(ticket.status, TicketStatus.IN_PROGRESS);

    const now = new Date();
    const priority = computePriority(ticket.urgency, dto.impact);
    const { responseDeadline, resolveDeadline } = computeDeadlines(priority, now);

    const [updated] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: {
          status: TicketStatus.IN_PROGRESS,
          agentUserid: dto.agentUserid,
          impact: dto.impact,
          priority,
          responseDeadline,
          resolveDeadline,
          actualResponseAt: ticket.actualResponseAt ?? now,
        },
        include: { category: true, events: true },
      }),
      this.recordEvent(id, actor.userid, TicketEventAction.ASSIGN, ticket.status, TicketStatus.IN_PROGRESS, null),
    ]);
    return updated;
  }

  /** 回复：在处理中/挂起/待确认状态下均可追加说明 */
  async reply(id: number, dto: ReplyTicketDto, actor: { userid: string; role: UserRole }) {
    const ticket = await this.findById(id);
    this.assertCanModify(ticket.status);
    await this.recordEvent(id, actor.userid, TicketEventAction.REPLY, null, null, dto.comment, dto.attachments);
    return this.findById(id);
  }

  /** 挂起：处理中 → 挂起，停计时（设计 3.1） */
  async suspend(id: number, dto: ReasonTicketDto, actor: { userid: string; role: UserRole }) {
    const ticket = await this.findById(id);
    this.assertTechOrAdmin(actor.role);
    assertTransitionAllowed(ticket.status, TicketStatus.SUSPENDED);
    return this.transition(id, TicketStatus.SUSPENDED, TicketEventAction.SUSPEND, actor.userid, dto.reason);
  }

  /** 恢复：挂起 → 处理中 */
  async resume(id: number, actor: { userid: string; role: UserRole }) {
    const ticket = await this.findById(id);
    this.assertTechOrAdmin(actor.role);
    assertTransitionAllowed(ticket.status, TicketStatus.IN_PROGRESS);
    return this.transition(id, TicketStatus.IN_PROGRESS, TicketEventAction.RESUME, actor.userid, null);
  }

  /** 解决：处理中 → 待确认，必须填写解决方案（设计 3.6） */
  async resolve(id: number, dto: ResolveTicketDto, actor: { userid: string; role: UserRole }) {
    const ticket = await this.findById(id);
    this.assertTechOrAdmin(actor.role);
    assertTransitionAllowed(ticket.status, TicketStatus.WAITING_CONFIRM);

    const [updated] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: { status: TicketStatus.WAITING_CONFIRM, solution: dto.solution },
        include: { category: true, events: true },
      }),
      this.recordEvent(id, actor.userid, TicketEventAction.RESOLVE, ticket.status, TicketStatus.WAITING_CONFIRM, null),
    ]);
    return updated;
  }

  /** 关闭：待确认 → 已关闭 */
  async close(id: number, actor: { userid: string; role: UserRole }) {
    const ticket = await this.findById(id);
    assertTransitionAllowed(ticket.status, TicketStatus.CLOSED);

    const [updated] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: {
          status: TicketStatus.CLOSED,
          actualResolveAt: ticket.actualResolveAt ?? new Date(),
        },
        include: { category: true, events: true },
      }),
      this.recordEvent(id, actor.userid, TicketEventAction.CLOSE, ticket.status, TicketStatus.CLOSED, null),
    ]);

    // 关单时把解决方案沉淀为知识草稿（设计 5.1）
    if (ticket.solution) {
      await this.kbService.createFromTicket(ticket);
    }

    return updated;
  }

  /** 取消：待处理/处理中 → 已取消 */
  async cancel(id: number, dto: ReasonTicketDto, actor: { userid: string; role: UserRole }) {
    const ticket = await this.findById(id);
    if (actor.role === UserRole.EMPLOYEE && ticket.requesterUserid !== actor.userid) {
      throw new ForbiddenException('只能取消自己提交的工单');
    }
    assertTransitionAllowed(ticket.status, TicketStatus.CANCELLED);
    return this.transition(id, TicketStatus.CANCELLED, TicketEventAction.CANCEL, actor.userid, dto.reason);
  }

  /** 转交：更换技术员，状态不变 */
  async transfer(id: number, dto: TransferTicketDto, actor: { userid: string; role: UserRole }) {
    const ticket = await this.findById(id);
    this.assertTechOrAdmin(actor.role);
    this.assertCanModify(ticket.status);

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { agentUserid: dto.agentUserid },
      include: { category: true, events: true },
    });
    await this.recordEvent(id, actor.userid, TicketEventAction.TRANSFER, null, null, `转交给 ${dto.agentUserid}`);
    return updated;
  }

  /** 打回：待确认 → 处理中 */
  async reject(id: number, dto: ReasonTicketDto, actor: { userid: string; role: UserRole }) {
    const ticket = await this.findById(id);
    this.assertTechOrAdmin(actor.role);
    assertTransitionAllowed(ticket.status, TicketStatus.IN_PROGRESS);
    return this.transition(id, TicketStatus.IN_PROGRESS, TicketEventAction.REJECT, actor.userid, dto.reason);
  }

  /** 列表：管理员看全部，员工看自己，技术员看指派给自己的 */
  async list(actor: { userid: string; role: UserRole }) {
    const where =
      actor.role === UserRole.ADMIN
        ? {}
        : actor.role === UserRole.TECHNICIAN
          ? { agentUserid: actor.userid }
          : { requesterUserid: actor.userid };
    return this.prisma.ticket.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 详情 */
  async detail(id: number) {
    return this.findById(id);
  }

  private async findById(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { category: true, events: { orderBy: { createdAt: 'desc' } } },
    });
    if (!ticket) throw new NotFoundException('工单不存在');
    return ticket;
  }

  private async transition(
    id: number,
    to: TicketStatus,
    action: TicketEventAction,
    actorUserid: string,
    comment: string | null,
  ) {
    const ticket = await this.findById(id);
    assertTransitionAllowed(ticket.status, to);
    const [updated] = await this.prisma.$transaction([
      this.prisma.ticket.update({ where: { id }, data: { status: to }, include: { category: true, events: true } }),
      this.recordEvent(id, actorUserid, action, ticket.status, to, comment),
    ]);
    return updated;
  }

  private recordEvent(
    ticketId: number,
    actorUserid: string,
    action: TicketEventAction,
    fromStatus: TicketStatus | null,
    toStatus: TicketStatus | null,
    comment: string | null,
    attachments?: string[],
  ) {
    return this.prisma.ticketEvent.create({
      data: {
        ticketId,
        actorUserid,
        action,
        fromStatus,
        toStatus,
        comment,
        attachments: attachments ?? [],
      },
    });
  }

  private async generateTicketNo() {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const count = await this.prisma.ticket.count({
      where: { createdAt: { gte: start, lt: end } },
    });
    return `INC-${date}-${String(count + 1).padStart(3, '0')}`;
  }

  private assertTechOrAdmin(role: UserRole) {
    if (role !== UserRole.TECHNICIAN && role !== UserRole.ADMIN) {
      throw new ForbiddenException('仅技术员或管理员可操作');
    }
  }

  private assertCanModify(status: TicketStatus) {
    if (status === TicketStatus.CLOSED || status === TicketStatus.CANCELLED) {
      throw new ForbiddenException('工单已结束，不可操作');
    }
  }
}
