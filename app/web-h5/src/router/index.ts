/**
 * 文件：web-h5/src/router/index.ts
 * 职责：企微端 H5 路由定义
 * 对应设计：docs/02-开发计划.md R0
 */
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/login', component: LoginView },
    { path: '/home', component: HomeView },
  ],
});

export default router;
