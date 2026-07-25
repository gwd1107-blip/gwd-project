/**
 * 文件：server/src/modules/auth/current-user.decorator.ts
 * 职责：从请求中取出当前登录用户
 * 对应设计：docs/02-开发计划.md R1
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from './auth.service';

export interface CurrentUserType {
  id: number;
  userid: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest<{ user: TokenPayload }>();
    const u = request.user;
    return { id: u.sub, userid: u.userid, role: u.role };
  },
);
