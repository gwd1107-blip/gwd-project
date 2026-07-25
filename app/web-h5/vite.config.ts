/**
 * 文件：web-h5/vite.config.ts
 * 职责：Vite 配置，企微端 H5 开发服务器
 * 对应设计：docs/02-开发计划.md R0
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
