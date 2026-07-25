/**
 * 文件：server/src/modules/auth/auth.service.ts
 * 职责：Mock 登录校验与 JWT 签发
 * 对应设计：docs/02-开发计划.md R1（R7 替换为企微 OAuth）
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { UserService } from '../user/user.service';

export interface TokenPayload {
  sub: number;
  userid: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {}

  async login(userid: string) {
    const user = await this.userService.findByUserid(userid);
    if (!user || !user.enabled) {
      throw new UnauthorizedException('用户不存在或已停用');
    }

    const payload: TokenPayload = {
      sub: user.id,
      userid: user.userid,
      role: user.role,
    };

    const secret = this.config.get('JWT_SECRET') ?? 'dev-secret';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return { token, user };
  }
}
