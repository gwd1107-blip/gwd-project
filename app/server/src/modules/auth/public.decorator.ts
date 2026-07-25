/**
 * 文件：server/src/modules/auth/public.decorator.ts
 * 职责：标记允许匿名访问的路由
 * 对应设计：docs/02-开发计划.md R1
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
