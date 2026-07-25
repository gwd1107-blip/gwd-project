/**
 * 文件：server/src/modules/user/user.service.ts
 * 职责：用户与部门数据访问、角色判定
 * 对应设计：docs/01-MVP产品设计方案.md 第 2.3 节（三种角色）
 */
import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserid(userid: string) {
    return this.prisma.user.findUnique({
      where: { userid },
      include: { department: true },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  isRole(user: { role: UserRole }, role: UserRole) {
    return user.role === role;
  }
}
