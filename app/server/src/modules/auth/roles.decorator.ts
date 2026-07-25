/**
 * 文件：server/src/modules/auth/roles.decorator.ts
 * 职责：角色权限元数据装饰器
 * 对应设计：docs/01-MVP产品设计方案.md 第 2.3 节
 */
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
