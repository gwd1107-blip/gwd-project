/**
 * 文件：server/src/modules/ticket/__tests__/ticket.state-machine.spec.ts
 * 职责：状态机单元测试
 * 对应设计：docs/01-MVP产品设计方案.md 第 3.1 节
 */
import { describe, it, expect } from 'vitest';
import { TicketStatus } from '@prisma/client';
import { assertTransitionAllowed, availableTransitions } from '../ticket.state-machine';

describe('ticket.state-machine', () => {
  it('待处理可接单、可取消', () => {
    expect(availableTransitions(TicketStatus.PENDING)).toContain(TicketStatus.IN_PROGRESS);
    expect(availableTransitions(TicketStatus.PENDING)).toContain(TicketStatus.CANCELLED);
  });

  it('处理中可解决、挂起、取消', () => {
    expect(availableTransitions(TicketStatus.IN_PROGRESS)).toContain(TicketStatus.WAITING_CONFIRM);
    expect(availableTransitions(TicketStatus.IN_PROGRESS)).toContain(TicketStatus.SUSPENDED);
    expect(availableTransitions(TicketStatus.IN_PROGRESS)).toContain(TicketStatus.CANCELLED);
  });

  it('待确认可关闭、可被打回处理中', () => {
    expect(availableTransitions(TicketStatus.WAITING_CONFIRM)).toContain(TicketStatus.CLOSED);
    expect(availableTransitions(TicketStatus.WAITING_CONFIRM)).toContain(TicketStatus.IN_PROGRESS);
  });

  it('挂起可恢复处理中', () => {
    expect(availableTransitions(TicketStatus.SUSPENDED)).toEqual([TicketStatus.IN_PROGRESS]);
  });

  it('终态不可流转', () => {
    expect(availableTransitions(TicketStatus.CLOSED)).toEqual([]);
    expect(availableTransitions(TicketStatus.CANCELLED)).toEqual([]);
  });

  it('非法流转应抛错', () => {
    expect(() => assertTransitionAllowed(TicketStatus.PENDING, TicketStatus.CLOSED)).toThrow();
    expect(() => assertTransitionAllowed(TicketStatus.IN_PROGRESS, TicketStatus.PENDING)).toThrow();
  });
});
