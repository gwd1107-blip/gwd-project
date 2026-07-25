/**
 * 文件：web-h5/src/utils.ts
 * 职责：状态/角色/优先级中文映射
 */
export const statusText: Record<string, string> = {
  PENDING: '待处理',
  IN_PROGRESS: '处理中',
  WAITING_CONFIRM: '待确认',
  CLOSED: '已关闭',
  SUSPENDED: '挂起',
  CANCELLED: '已取消',
};

export const roleText: Record<string, string> = {
  EMPLOYEE: '员工',
  TECHNICIAN: '技术员',
  ADMIN: '管理员',
};

export const priorityText: Record<string, string> = {
  P1: 'P1-紧急',
  P2: 'P2-高',
  P3: 'P3-中',
  P4: 'P4-低',
};

export const urgencyText: Record<string, string> = {
  LOW: '不紧急',
  MEDIUM: '有点急',
  HIGH: '很急',
};
