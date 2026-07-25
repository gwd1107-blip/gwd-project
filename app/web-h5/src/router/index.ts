/**
 * 文件：web-h5/src/router/index.ts
 * 职责：企微端 H5 路由定义与登录守卫
 * 对应设计：docs/02-开发计划.md R1
 */
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/home', component: HomeView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('itsm_token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.public && token) {
    next('/home');
  } else {
    next();
  }
});

export default router;
