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

  /** 企微 OAuth 首次登录时创建/更新用户 */
  async upsertWecomUser(data: {
    userid: string;
    name: string;
    avatar?: string;
    deptId?: number;
    role?: UserRole;
  }) {
    const deptId = data.deptId ?? (await this.ensureDefaultDept());
    return this.prisma.user.upsert({
      where: { userid: data.userid },
      update: { name: data.name, avatar: data.avatar },
      create: {
        userid: data.userid,
        name: data.name,
        avatar: data.avatar,
        role: data.role ?? UserRole.EMPLOYEE,
        deptId,
      },
    });
  }

  private async ensureDefaultDept() {
    const dept = await this.prisma.department.upsert({
      where: { wecomDeptId: 'dept_default' },
      update: {},
      create: { wecomDeptId: 'dept_default', name: '默认部门', order: 999 },
    });
    return dept.id;
  }
}
