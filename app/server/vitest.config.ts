/**
 * 文件：server/vitest.config.ts
 * 职责：Vitest 配置（R2 起用于状态机/策略单测）
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
