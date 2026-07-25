/**
 * 文件：web-h5/src/main.ts
 * 职责：企微端 H5 应用入口
 * 对应设计：docs/02-开发计划.md R0
 */
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'vant/lib/index.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
