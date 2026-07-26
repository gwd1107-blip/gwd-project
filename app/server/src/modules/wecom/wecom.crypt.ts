/**
 * 文件：server/src/modules/wecom/wecom.crypt.ts
 * 职责：企微回调消息加解密与验签
 * 对应设计：docs/02-开发计划.md R7
 */
import { createHash, createDecipheriv } from 'crypto';

/** 计算签名 */
export function getSignature(token: string, timestamp: string, nonce: string, encryptMsg: string) {
  return createHash('sha1')
    .update([token, timestamp, nonce, encryptMsg].sort().join(''))
    .digest('hex');
}

/** 解密 AES-256-CBC 消息 */
export function decryptMessage(aesKey: string, encryptMsg: string, corpid: string) {
  const key = Buffer.from(aesKey + '=', 'base64');
  const iv = key.subarray(0, 16);
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  decipher.setAutoPadding(false);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptMsg, 'base64')),
    decipher.final(),
  ]);

  // 去 PKCS7 padding
  const pad = decrypted[decrypted.length - 1];
  const plain = decrypted.subarray(0, decrypted.length - pad);

  // random(16) + msg_len(4, BE) + msg + receiveid
  const msgLen = plain.readUInt32BE(16);
  const msg = plain.subarray(20, 20 + msgLen).toString();
  const receiveid = plain.subarray(20 + msgLen).toString();
  if (receiveid !== corpid) {
    throw new Error('corpid 校验失败');
  }
  return msg;
}
