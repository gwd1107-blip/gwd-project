/**
 * 文件：server/src/modules/user/user.module.ts
 * 职责：用户/部门模块组装
 * 对应设计：docs/01-MVP产品设计方案.md 第 2 节（用户体系）
 */
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
