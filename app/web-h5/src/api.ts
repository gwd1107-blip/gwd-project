/**
 * 文件：web-h5/src/api.ts
 * 职责：封装带 Token 的 fetch
 * 对应设计：docs/02-开发计划.md R3
 */
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('itsm_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('itsm_token');
    localStorage.removeItem('itsm_user');
    window.location.href = '/login';
    throw new Error('登录已过期');
  }
  return res;
}
