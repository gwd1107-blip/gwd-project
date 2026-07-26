/**
 * 文件：server/src/modules/wecom/wecom.message.service.ts
 * 职责：企微消息发送（模板卡片）
 * 对应设计：docs/01-MVP产品设计方案.md 第 2.2 节
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loadWecomConfig } from './wecom.config';
import { WecomApiService } from './wecom.api.service';

export interface WecomCardInput {
  touser: string;
  title: string;
  content: string;
  url?: string;
}

@Injectable()
export class WecomMessageService {
  constructor(
    private readonly wecomApi: WecomApiService,
    private readonly config: ConfigService,
  ) {}

  async sendTemplateCard(input: WecomCardInput) {
    const { agentId } = loadWecomConfig(this.config);
    const body = {
      touser: input.touser,
      msgtype: 'template_card',
      agentid: Number(agentId),
      template_card: {
        card_type: 'text_notice',
        main_title: {
          title: input.title,
        },
        sub_title_text: input.content,
        card_action: {
          type: 1,
          url: input.url ?? 'https://work.weixin.qq.com',
        },
      },
    };
    return this.wecomApi.post('/cgi-bin/message/send', body);
  }
}
