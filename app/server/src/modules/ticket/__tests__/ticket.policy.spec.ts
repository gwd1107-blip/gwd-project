/**
 * 文件：server/src/modules/ticket/__tests__/ticket.policy.spec.ts
 * 职责：优先级与 SLA 时限单元测试
 * 对应设计：docs/01-MVP产品设计方案.md 第 3.5 节
 */
import { describe, it, expect } from 'vitest';
import { Impact, Priority, Urgency } from '@prisma/client';
import { computeDeadlines, computePriority } from '../ticket.policy';

describe('ticket.policy', () => {
  it('很急 × 全公司 = P1', () => {
    expect(computePriority(Urgency.HIGH, Impact.ALL)).toBe(Priority.P1);
  });

  it('很急 × 多人 = P2', () => {
    expect(computePriority(Urgency.HIGH, Impact.SEVERAL)).toBe(Priority.P2);
  });

  it('有点急 × 多人 = P3', () => {
    expect(computePriority(Urgency.MEDIUM, Impact.SEVERAL)).toBe(Priority.P3);
  });

  it('不紧急无论影响面都是 P4', () => {
    expect(computePriority(Urgency.LOW, Impact.ONLY_ME)).toBe(Priority.P4);
    expect(computePriority(Urgency.LOW, Impact.ALL)).toBe(Priority.P4);
  });

  it('P1 响应时限 15 分钟，解决时限 4 小时', () => {
    const start = new Date('2026-07-25T10:00:00Z');
    const { responseDeadline, resolveDeadline } = computeDeadlines(Priority.P1, start);
    expect(responseDeadline.getTime()).toBe(start.getTime() + 15 * 60_000);
    expect(resolveDeadline.getTime()).toBe(start.getTime() + 4 * 60 * 60_000);
  });

  it('P4 响应时限 1 天，解决时限 3 天', () => {
    const start = new Date('2026-07-25T10:00:00Z');
    const { responseDeadline, resolveDeadline } = computeDeadlines(Priority.P4, start);
    expect(responseDeadline.getTime()).toBe(start.getTime() + 24 * 60 * 60_000);
    expect(resolveDeadline.getTime()).toBe(start.getTime() + 3 * 24 * 60 * 60_000);
  });
});
