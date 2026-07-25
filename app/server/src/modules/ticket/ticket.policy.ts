/**
 * 文件：server/src/modules/ticket/ticket.policy.ts
 * 职责：优先级计算与 SLA 时限推导（SLA-Lite）
 * 对应设计：docs/01-MVP产品设计方案.md 第 3.5 节
 */
import { Urgency, Impact, Priority } from '@prisma/client';

// 优先级矩阵：urgency × impact → Priority
const priorityMatrix: Record<Urgency, Record<Impact, Priority>> = {
  [Urgency.LOW]: {
    [Impact.ONLY_ME]: Priority.P4,
    [Impact.SEVERAL]: Priority.P4,
    [Impact.ALL]: Priority.P4,
  },
  [Urgency.MEDIUM]: {
    [Impact.ONLY_ME]: Priority.P4,
    [Impact.SEVERAL]: Priority.P3,
    [Impact.ALL]: Priority.P2,
  },
  [Urgency.HIGH]: {
    [Impact.ONLY_ME]: Priority.P3,
    [Impact.SEVERAL]: Priority.P2,
    [Impact.ALL]: Priority.P1,
  },
};

// 默认 SLA 时限（分钟）：设计 3.5 示例值
const slaMinutes: Record<Priority, { response: number; resolve: number }> = {
  [Priority.P1]: { response: 15, resolve: 4 * 60 },
  [Priority.P2]: { response: 60, resolve: 8 * 60 },
  [Priority.P3]: { response: 4 * 60, resolve: 24 * 60 },
  [Priority.P4]: { response: 24 * 60, resolve: 72 * 60 },
};

/** 根据紧急程度和影响面计算优先级 */
export function computePriority(urgency: Urgency, impact: Impact): Priority {
  return priorityMatrix[urgency][impact];
}

/** 根据优先级和起始时间计算响应/解决时限 */
export function computeDeadlines(
  priority: Priority,
  startAt: Date,
): { responseDeadline: Date; resolveDeadline: Date } {
  const { response, resolve } = slaMinutes[priority];
  return {
    responseDeadline: addMinutes(startAt, response),
    resolveDeadline: addMinutes(startAt, resolve),
  };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
