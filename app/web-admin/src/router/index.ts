/**
 * 文件：web-admin/src/router/index.ts
 * 职责：管理端路由定义
 * 对应设计：docs/02-开发计划.md R0
 */
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginView },
    { path: '/dashboard', component: DashboardView },
  ],
});

export default router;
