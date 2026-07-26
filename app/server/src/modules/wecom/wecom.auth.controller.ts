/**
 * 文件：server/src/modules/wecom/wecom.auth.controller.ts
 * 职责：企微 OAuth 登录（H5 免密 + 管理端扫码）
 * 对应设计：docs/01-MVP产品设计方案.md 第 2.2 节
 */
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { UserRole } from '@prisma/client';
import { loadWecomConfig } from './wecom.config';
import { WecomApiService } from './wecom.api.service';

@Controller('wecom/oauth')
export class WecomAuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly wecomApi: WecomApiService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /** 返回 H5 免密授权 URL */
  @Get('h5-url')
  h5Url() {
    const { corpid, agentId, callbackBaseUrl } = loadWecomConfig(this.config);
    const redirectUri = encodeURIComponent(`${callbackBaseUrl}/api/wecom/oauth/callback?state=h5`);
    const url =
      `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpid}` +
      `&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base` +
      `&agentid=${agentId}&state=h5#wechat_redirect`;
    return { url };
  }

  /** 返回管理端扫码授权 URL */
  @Get('admin-url')
  adminUrl() {
    const { corpid, agentId, callbackBaseUrl } = loadWecomConfig(this.config);
    const redirectUri = encodeURIComponent(`${callbackBaseUrl}/api/wecom/oauth/callback?state=admin`);
    const url =
      `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=${corpid}` +
      `&agentid=${agentId}&redirect_uri=${redirectUri}&state=admin`;
    return { url };
  }

  /** OAuth 回调：code 换 userid，签发 JWT 并跳回前端 */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const userInfo = await this.wecomApi.get(`/cgi-bin/user/getuserinfo?code=${code}`);
    const userid = userInfo.userid;
    const detail = await this.wecomApi.get(`/cgi-bin/user/get?userid=${userid}`);

    await this.userService.upsertWecomUser({
      userid: detail.userid,
      name: detail.name ?? detail.userid,
      avatar: detail.avatar,
      deptId: undefined,
      role: UserRole.EMPLOYEE,
    });

    const { token } = await this.authService.login(userid);
    const { h5BaseUrl, adminBaseUrl } = loadWecomConfig(this.config);
    const base = state === 'admin' ? adminBaseUrl : h5BaseUrl;
    res.redirect(`${base}/wecom-callback?token=${encodeURIComponent(token)}`);
  }
}
