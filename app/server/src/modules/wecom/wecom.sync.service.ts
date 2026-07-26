/**
 * 文件：server/src/modules/wecom/wecom.sync.service.ts
 * 职责：企微通讯录同步（全量 + 幂等）
 * 对应设计：docs/01-MVP产品设计方案.md 第 2.2 节
 */
import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WecomApiService } from './wecom.api.service';

@Injectable()
export class WecomSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wecomApi: WecomApiService,
  ) {}

  /** 全量同步部门与用户 */
  async syncAll() {
    const departments = await this.syncDepartments();
    const users = await this.syncUsers(departments);
    return { departments: departments.length, users: users.length };
  }

  private async syncDepartments() {
    const res = await this.wecomApi.get('/cgi-bin/department/list');
    const list: any[] = res.department ?? [];
    const saved: any[] = [];
    for (const d of list) {
      const dept = await this.prisma.department.upsert({
        where: { wecomDeptId: String(d.id) },
        update: {
          name: d.name,
          parentId: d.parentid ? String(d.parentid) : null,
          order: d.order ?? 0,
        },
        create: {
          wecomDeptId: String(d.id),
          name: d.name,
          parentId: d.parentid ? String(d.parentid) : null,
          order: d.order ?? 0,
        },
      });
      saved.push(dept);
    }
    return saved;
  }

  private async syncUsers(departments: any[]) {
    const res = await this.wecomApi.get('/cgi-bin/user/list?department_id=1&fetch_child=1');
    const list: any[] = res.userlist ?? [];
    const deptMap = new Map(departments.map((d) => [d.wecomDeptId, d.id]));
    const itDept = departments.find((d) => d.name.includes('IT') || d.name.includes('技术'));
    const saved: any[] = [];

    for (const u of list) {
      const deptId = u.department?.[0] != null ? deptMap.get(String(u.department[0])) : undefined;
      const role = itDept && deptId === itDept.id ? UserRole.TECHNICIAN : UserRole.EMPLOYEE;
      const user = await this.prisma.user.upsert({
        where: { userid: u.userid },
        update: {
          name: u.name,
          avatar: u.avatar,
          enabled: u.status !== 4,
          deptId,
        },
        create: {
          userid: u.userid,
          name: u.name,
          avatar: u.avatar,
          role,
          deptId,
        },
      });
      saved.push(user);
    }
    return saved;
  }
}
