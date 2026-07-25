/**
 * 文件：web-admin/src/main.ts
 * 职责：管理端应用入口
 * 对应设计：docs/02-开发计划.md R0
 */
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(ElementPlus);
app.use(router);
app.mount('#app');
