/**
 * 文件：server/src/modules/wecom/wecom.callback.controller.ts
 * 职责：企微回调 URL 验证与消息事件处理
 * 对应设计：docs/02-开发计划.md R7
 */
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { loadWecomConfig } from './wecom.config';
import { decryptMessage, getSignature } from './wecom.crypt';

@Controller('wecom/callback')
@Public()
export class WecomCallbackController {
  constructor(private readonly config: ConfigService) {}

  /** URL 验证（企微配置回调时调用） */
  @Get()
  verify(
    @Query('msg_signature') msgSignature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
    @Res() res: Response,
  ) {
    const { token, encodingAesKey, corpid } = loadWecomConfig(this.config);
    const signature = getSignature(token, timestamp, nonce, echostr);
    if (signature !== msgSignature) {
      return res.status(403).send('signature verify failed');
    }
    const plain = decryptMessage(encodingAesKey, echostr, corpid);
    res.type('text/plain').send(plain);
  }

  /** 事件回调（按钮点击/通讯录变更） */
  @Post()
  async event(
    @Body() body: string,
    @Query('msg_signature') msgSignature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Res() res: Response,
  ) {
    const { token, encodingAesKey, corpid } = loadWecomConfig(this.config);

    const match = body.match(/<Encrypt>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/Encrypt>/s);
    if (!match) return res.status(400).send('bad xml');
    const encryptMsg = match[1];

    const signature = getSignature(token, timestamp, nonce, encryptMsg);
    if (signature !== msgSignature) {
      return res.status(403).send('signature verify failed');
    }

    const plainXml = decryptMessage(encodingAesKey, encryptMsg, corpid);
    console.log('[wecom callback]', plainXml);

    // TODO: 解析事件类型并处理按钮回调（assign/resolve/transfer）
    // 当前先返回 success，避免企微重复推送
    res.type('text/plain').send('success');
  }
}
