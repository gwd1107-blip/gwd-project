/**
 * 文件：server/prisma/seed.ts
 * 职责：初始化 3 个测试账号、部门与预置分类
 * 对应设计：docs/01-MVP产品设计方案.md 第 2.3 节（角色）、3.4 节（分类）
 */
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 部门
  const itDept = await prisma.department.upsert({
    where: { wecomDeptId: 'dept_it' },
    update: {},
    create: { wecomDeptId: 'dept_it', name: 'IT 部', order: 1 },
  });
  const allDept = await prisma.department.upsert({
    where: { wecomDeptId: 'dept_all' },
    update: {},
    create: { wecomDeptId: 'dept_all', name: '全员', order: 2 },
  });

  // 2. 三个角色账号（Mock 体系，R7 切换为企微）
  const users = [
    { userid: 'emp001', name: '张三', role: UserRole.EMPLOYEE, deptId: allDept.id },
    { userid: 'tech001', name: '李四', role: UserRole.TECHNICIAN, deptId: itDept.id, skillTags: ['桌面支持'] },
    { userid: 'admin001', name: '王五', role: UserRole.ADMIN, deptId: itDept.id },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { userid: u.userid },
      update: {},
      create: u,
    });
  }

  // 3. 预置两级分类（设计 3.4）
  const groups = [
    { name: '网络问题', children: ['无法上网', '网速慢', 'VPN', 'WiFi'] },
    { name: '账号权限', children: ['账号申请', '密码重置', '权限开通', '离职清理'] },
    { name: '电脑设备', children: ['电脑故障', '打印机', '外设', '系统重装'] },
    { name: '软件应用', children: ['办公软件', '业务系统', '软件安装'] },
    { name: '邮箱会议', children: ['邮箱', '会议设备', '投屏'] },
    { name: '其他', children: [] },
  ];

  let order = 0;
  for (const g of groups) {
    let parent = await prisma.category.findFirst({ where: { parentId: null, name: g.name } });
    if (!parent) {
      parent = await prisma.category.create({
        data: { parentId: null, name: g.name, level: 1, order: order++ },
      });
    }
    for (const [idx, child] of g.children.entries()) {
      const exists = await prisma.category.findFirst({
        where: { parentId: parent.id, name: child },
      });
      if (!exists) {
        await prisma.category.create({
          data: { parentId: parent.id, name: child, level: 2, order: idx },
        });
      }
    }
  }

  console.log('Seed done: 3 users + departments + categories');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
