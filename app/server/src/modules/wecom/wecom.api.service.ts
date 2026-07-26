/**
 * 文件：server/src/modules/wecom/wecom.api.service.ts
 * 职责：企微 API 客户端（token 缓存 + GET/POST）
 * 对应设计：docs/01-MVP产品设计方案.md 第 2.2 节
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loadWecomConfig } from './wecom.config';

@Injectable()
export class WecomApiService {
  private token?: string;
  private tokenExpireAt?: number;

  constructor(private readonly config: ConfigService) {}

  private get wecomConfig() {
    return loadWecomConfig(this.config);
  }

  async getAccessToken(): Promise<string> {
    if (this.token && this.tokenExpireAt && this.tokenExpireAt > Date.now()) {
      return this.token;
    }
    const { corpid, secret } = this.wecomConfig;
    const res = await fetch(
      `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${secret}`,
    );
    const data = await res.json();
    if (data.errcode !== 0) {
      throw new Error(`获取企微 token 失败: ${data.errmsg}`);
    }
    this.token = data.access_token;
    this.tokenExpireAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.token!;
  }

  async get(path: string) {
    const token = await this.getAccessToken();
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`https://qyapi.weixin.qq.com${path}${sep}access_token=${token}`);
    const data = await res.json();
    if (data.errcode !== 0) {
      throw new Error(`企微 API GET ${path} 失败: ${data.errmsg}`);
    }
    return data;
  }

  async post(path: string, body: unknown) {
    const token = await this.getAccessToken();
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`https://qyapi.weixin.qq.com${path}${sep}access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.errcode !== 0) {
      throw new Error(`企微 API POST ${path} 失败: ${data.errmsg}`);
    }
    return data;
  }
}
