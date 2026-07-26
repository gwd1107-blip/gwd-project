/**
 * 文件：server/src/modules/wecom/wecom.config.ts
 * 职责：读取企微相关环境变量
 * 对应设计：docs/02-开发计划.md R7
 */
import { ConfigService } from '@nestjs/config';

export interface WecomConfig {
  corpid: string;
  secret: string;
  agentId: string;
  token: string;
  encodingAesKey: string;
  h5BaseUrl: string;
  adminBaseUrl: string;
  callbackBaseUrl: string;
}

export function loadWecomConfig(config: ConfigService): WecomConfig {
  return {
    corpid: config.get('WECOM_CORPID') ?? '',
    secret: config.get('WECOM_SECRET') ?? '',
    agentId: config.get('WECOM_AGENT_ID') ?? '',
    token: config.get('WECOM_TOKEN') ?? '',
    encodingAesKey: config.get('WECOM_ENCODING_AES_KEY') ?? '',
    h5BaseUrl: config.get('WECOM_H5_BASE_URL') ?? 'http://localhost:5173',
    adminBaseUrl: config.get('WECOM_ADMIN_BASE_URL') ?? 'http://localhost:5174',
    callbackBaseUrl: config.get('WECOM_CALLBACK_BASE_URL') ?? 'http://tvad.value-data.cn',
  };
}
