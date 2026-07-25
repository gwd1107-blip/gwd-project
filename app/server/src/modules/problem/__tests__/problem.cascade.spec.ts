/**
 * 文件：server/src/modules/problem/__tests__/problem.cascade.spec.ts
 * 职责：级联解决过滤逻辑单测
 * 对应设计：docs/01-MVP产品设计方案.md 第 4.1 节
 */
import { describe, it, expect } from 'vitest';
import { TicketStatus } from '@prisma/client';
import { ticketsToCascadeClose } from '../problem.cascade';

describe('problem.cascade', () => {
  it('跳过已关闭/已取消的工单', () => {
    const tickets = [
      { ticketId: 1, status: TicketStatus.PENDING },
      { ticketId: 2, status: TicketStatus.IN_PROGRESS },
      { ticketId: 3, status: TicketStatus.CLOSED },
      { ticketId: 4, status: TicketStatus.CANCELLED },
      { ticketId: 5, status: TicketStatus.WAITING_CONFIRM },
    ];
    expect(ticketsToCascadeClose(tickets)).toEqual([1, 2, 5]);
  });

  it('全部终态时返回空数组', () => {
    const tickets = [
      { ticketId: 1, status: TicketStatus.CLOSED },
      { ticketId: 2, status: TicketStatus.CANCELLED },
    ];
    expect(ticketsToCascadeClose(tickets)).toEqual([]);
  });
});
