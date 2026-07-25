/**
 * 文件：server/src/modules/ticket/ticket.state-machine.ts
 * 职责：工单状态机纯函数，集中管理合法流转
 * 对应设计：docs/01-MVP产品设计方案.md 第 3.1 节
 */
import { TicketStatus } from '@prisma/client';

// 状态中文显示（设计：状态全中文，无翻译腔）
export const statusText: Record<TicketStatus, string> = {
  PENDING: '待处理',
  IN_PROGRESS: '处理中',
  WAITING_CONFIRM: '待确认',
  CLOSED: '已关闭',
  SUSPENDED: '挂起',
  CANCELLED: '已取消',
};

// 合法流转表：key 为当前状态，value 为可直接流转到的状态集合
const transitions: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.PENDING]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.WAITING_CONFIRM,
    TicketStatus.SUSPENDED,
    TicketStatus.CANCELLED,
  ],
  [TicketStatus.WAITING_CONFIRM]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
  [TicketStatus.SUSPENDED]: [TicketStatus.IN_PROGRESS],
  // 终态不可流转
  [TicketStatus.CLOSED]: [],
  [TicketStatus.CANCELLED]: [],
};

/**
 * 判断状态流转是否合法。不合法时抛出业务异常。
 */
export function assertTransitionAllowed(from: TicketStatus, to: TicketStatus) {
  const allowed = transitions[from] ?? [];
  if (!allowed.includes(to)) {
    throw new Error(`非法状态流转：${statusText[from]} → ${statusText[to]}`);
  }
}

/** 获取从当前状态可流转的目标状态列表 */
export function availableTransitions(from: TicketStatus): TicketStatus[] {
  return [...(transitions[from] ?? [])];
}
