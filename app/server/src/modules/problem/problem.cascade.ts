/**
 * 文件：server/src/modules/problem/problem.cascade.ts
 * 职责：级联解决过滤逻辑（纯函数，便于单测）
 * 对应设计：docs/01-MVP产品设计方案.md 第 4.1 节
 */
import { TicketStatus } from '@prisma/client';

export interface IncidentTicketRef {
  ticketId: number;
  status: TicketStatus;
}

/**
 * 过滤出需要级联关闭的工单：跳过已关闭/已取消的终态。
 */
export function ticketsToCascadeClose(tickets: IncidentTicketRef[]): number[] {
  return tickets
    .filter((t) => t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.CANCELLED)
    .map((t) => t.ticketId);
}
