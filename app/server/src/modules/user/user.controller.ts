/**
 * 文件：server/src/modules/user/user.controller.ts
 * 职责：用户相关 API（当前用户信息、列表）
 * 对应设计：docs/01-MVP产品设计方案.md 第 2.3 节
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  me(@CurrentUser() user: { id: number }) {
    return this.userService.findById(user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  list() {
    return this.userService.findAll();
  }
}
