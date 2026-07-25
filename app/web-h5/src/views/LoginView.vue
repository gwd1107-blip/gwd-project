<template>
  <div class="login-page">
    <h1>IT 服务台</h1>
    <p>请选择测试账号登录</p>
    <div class="accounts">
      <van-button type="primary" block @click="login('emp001')">员工 · 张三</van-button>
      <van-button type="success" block @click="login('tech001')">技术员 · 李四</van-button>
      <van-button type="warning" block @click="login('admin001')">管理员 · 王五</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button as VanButton } from 'vant';

const router = useRouter();
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

async function login(userid: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userid }),
  });
  if (!res.ok) {
    alert('登录失败');
    return;
  }
  const data = await res.json();
  localStorage.setItem('itsm_token', data.token);
  localStorage.setItem('itsm_user', JSON.stringify(data.user));
  router.push('/home');
}
</script>

<style scoped>
.login-page {
  padding: 48px 24px;
  text-align: center;
}
h1 {
  margin-bottom: 8px;
}
p {
  color: #666;
  margin-bottom: 32px;
}
.accounts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
