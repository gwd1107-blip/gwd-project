/**
 * 文件：web-admin/src/utils.ts
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

export const statusType: Record<string, any> = {
  PENDING: 'info',
  IN_PROGRESS: 'primary',
  WAITING_CONFIRM: 'warning',
  CLOSED: 'success',
  SUSPENDED: 'danger',
  CANCELLED: 'danger',
};

export const priorityText: Record<string, string> = {
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
  P4: 'P4',
};

export const problemStatusText: Record<string, string> = {
  INVESTIGATING: '调查中',
  ROOT_CAUSE_FOUND: '已定位根因',
  KNOWN_ERROR: '已知错误',
  RESOLVED: '已解决',
};

export const problemStatusType: Record<string, any> = {
  INVESTIGATING: 'info',
  ROOT_CAUSE_FOUND: 'primary',
  KNOWN_ERROR: 'warning',
  RESOLVED: 'success',
};
