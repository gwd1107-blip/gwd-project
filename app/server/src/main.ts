/**
 * 文件：server/src/main.ts
 * 职责：NestJS 应用入口，启动 HTTP 服务
 * 对应设计：docs/02-开发计划.md R0
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
