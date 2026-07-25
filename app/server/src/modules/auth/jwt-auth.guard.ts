/**
 * 文件：server/src/modules/auth/jwt-auth.guard.ts
 * 职责：JWT 认证守卫，跳过 @Public() 路由
 * 对应设计：docs/02-开发计划.md R1
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from './public.decorator';
import { TokenPayload } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request & { user?: TokenPayload }>();
    const authHeader = (request.headers['authorization'] as string | undefined) ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const verify = (t: string) => jwt.verify(t, this.getSecret()) as unknown as TokenPayload;

    // 公共路由：允许匿名访问，但仍尝试解析 token 供后续使用
    if (isPublic) {
      if (token) {
        try {
          request.user = verify(token);
        } catch {
          // 公共路由不抛认证错误
        }
      }
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('缺少 Token');
    }

    try {
      request.user = verify(token);
      return true;
    } catch {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }

  private getSecret() {
    return (this.config.get('JWT_SECRET') ?? 'dev-secret') as string;
  }
}
