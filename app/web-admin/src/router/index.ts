/**
 * 文件：web-admin/src/router/index.ts
 * 职责：管理端路由定义与登录守卫
 * 对应设计：docs/02-开发计划.md R3
 */
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import TicketListView from '../views/TicketListView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/tickets', component: TicketListView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('itsm_token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.public && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
