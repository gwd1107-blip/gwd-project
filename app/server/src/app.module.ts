/**
 * 文件：server/src/app.module.ts
 * 职责：根模块，组装 Prisma、健康检查等全局模块
 * 对应设计：docs/02-开发计划.md R0
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TicketModule } from './modules/ticket/ticket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    UserModule,
    AuthModule,
    TicketModule,
  ],
})
export class AppModule {}
