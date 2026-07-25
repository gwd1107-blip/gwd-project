/**
 * 文件：server/src/modules/problem/problem.service.ts
 * 职责：问题管理核心业务（创建/流转/RCA/级联解决）
 * 对应设计：docs/01-MVP产品设计方案.md 第 4 节
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProblemStatus, TicketEventAction, TicketStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KbService } from '../kb/kb.service';
import { ticketsToCascadeClose } from './problem.cascade';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { AssociateTicketDto } from './dto/associate-ticket.dto';

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kbService: KbService,
  ) {}

  /** 从事件升级或手动创建问题 */
  async create(dto: CreateProblemDto, ownerUserid: string) {
    const problem = await this.prisma.problem.create({
      data: {
        title: dto.title,
        symptom: dto.symptom,
        rootCause: dto.rootCause,
        workaround: dto.workaround,
        ownerUserid,
      },
      include: { incidents: { include: { ticket: true } } },
    });

    if (dto.ticketId) {
      await this.associateTicket(problem.id, { ticketId: dto.ticketId }, { userid: ownerUserid, role: UserRole.TECHNICIAN });
    }

    return this.findById(problem.id);
  }

  /** 更新 RCA 字段或状态 */
  async updateRca(id: number, dto: UpdateProblemDto, actor: { userid: string; role: UserRole }) {
    const problem = await this.findById(id);
    this.assertTechOrAdmin(actor.role);
    if (dto.status) {
      this.assertProblemTransitionAllowed(problem.status, dto.status);
    }
    return this.prisma.problem.update({
      where: { id },
      data: {
        symptom: dto.symptom ?? undefined,
        rootCause: dto.rootCause ?? undefined,
        workaround: dto.workaround ?? undefined,
        finalSolution: dto.finalSolution ?? undefined,
        status: dto.status ?? undefined,
        isKnownError: dto.isKnownError ?? undefined,
      },
      include: { incidents: { include: { ticket: true } } },
    });
  }

  /** 标记为已知错误 */
  async markKnownError(id: number, actor: { userid: string; role: UserRole }) {
    const problem = await this.findById(id);
    this.assertTechOrAdmin(actor.role);
    this.assertProblemTransitionAllowed(problem.status, ProblemStatus.KNOWN_ERROR);
    const updated = await this.prisma.problem.update({
      where: { id },
      data: { status: ProblemStatus.KNOWN_ERROR, isKnownError: true },
      include: { incidents: { include: { ticket: true } } },
    });

    // 已知错误时把临时方案发布到知识库（设计 4.2/5.1）
    if (updated.workaround) {
      const categoryId = updated.incidents[0]?.ticket?.categoryId ?? 1;
      await this.kbService.publishFromProblem({
        id: updated.id,
        title: updated.title,
        workaround: updated.workaround,
        finalSolution: updated.finalSolution,
        categoryId,
      });
    }

    return updated;
  }

  /** 解决：记录最终方案，并级联关闭关联事件 */
  async resolve(id: number, finalSolution: string, actor: { userid: string; role: UserRole }) {
    const problem = await this.findById(id);
    this.assertTechOrAdmin(actor.role);
    this.assertProblemTransitionAllowed(problem.status, ProblemStatus.RESOLVED);

    const now = new Date();
    const ticketIds = ticketsToCascadeClose(
      problem.incidents.map((i) => ({ ticketId: i.ticketId, status: i.ticket.status })),
    );

    return this.prisma.$transaction(async (tx) => {
      // 1. 更新问题状态与最终方案
      const updatedProblem = await tx.problem.update({
        where: { id },
        data: {
          status: ProblemStatus.RESOLVED,
          finalSolution,
        },
        include: { incidents: { include: { ticket: true } } },
      });

      // 2. 级联关闭关联事件
      for (const ticketId of ticketIds) {
        await tx.ticket.update({
          where: { id: ticketId },
          data: {
            status: TicketStatus.CLOSED,
            solution: finalSolution,
            actualResolveAt: now,
          },
        });
        await tx.ticketEvent.create({
          data: {
            ticketId,
            actorUserid: actor.userid,
            action: TicketEventAction.CLOSE,
            fromStatus: null,
            toStatus: TicketStatus.CLOSED,
            comment: `关联问题已解决（问题 #${id}）`,
          },
        });
      }

      return updatedProblem;
    }).then(async (updatedProblem) => {
      // 问题解决后把最终方案发布到知识库（设计 4.1/5.1）
      if (updatedProblem.finalSolution) {
        const categoryId = updatedProblem.incidents[0]?.ticket?.categoryId ?? 1;
        await this.kbService.publishFromProblem({
          id: updatedProblem.id,
          title: updatedProblem.title,
          workaround: updatedProblem.workaround,
          finalSolution: updatedProblem.finalSolution,
          categoryId,
        });
      }
      return updatedProblem;
    });
  }

  /** 关联事件到问题 */
  async associateTicket(problemId: number, dto: AssociateTicketDto, actor: { userid: string; role: UserRole }) {
    this.assertTechOrAdmin(actor.role);
    await this.findById(problemId);
    await this.prisma.problemIncident.upsert({
      where: { problemId_ticketId: { problemId, ticketId: dto.ticketId } },
      update: {},
      create: { problemId, ticketId: dto.ticketId, meToo: dto.meToo ?? false },
    });
    return this.findById(problemId);
  }

  /** 列表：全部问题，含关联事件数 */
  async list() {
    return this.prisma.problem.findMany({
      include: {
        incidents: { include: { ticket: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** 已知错误列表（供 H5 查看） */
  async listKnownErrors() {
    return this.prisma.problem.findMany({
      where: { isKnownError: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** 详情 */
  async detail(id: number) {
    return this.findById(id);
  }

  private async findById(id: number) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: { incidents: { include: { ticket: true } } },
    });
    if (!problem) throw new NotFoundException('问题不存在');
    return problem;
  }

  private assertTechOrAdmin(role: UserRole) {
    if (role !== UserRole.TECHNICIAN && role !== UserRole.ADMIN) {
      throw new ForbiddenException('仅技术员或管理员可操作');
    }
  }

  private assertProblemTransitionAllowed(from: ProblemStatus, to: ProblemStatus) {
    const allowed: Record<ProblemStatus, ProblemStatus[]> = {
      [ProblemStatus.INVESTIGATING]: [ProblemStatus.ROOT_CAUSE_FOUND, ProblemStatus.KNOWN_ERROR],
      [ProblemStatus.ROOT_CAUSE_FOUND]: [ProblemStatus.KNOWN_ERROR, ProblemStatus.RESOLVED],
      [ProblemStatus.KNOWN_ERROR]: [ProblemStatus.RESOLVED],
      [ProblemStatus.RESOLVED]: [],
    };
    if (!allowed[from]?.includes(to)) {
      throw new ForbiddenException(`问题状态不可从 ${from} 流转到 ${to}`);
    }
  }
}
