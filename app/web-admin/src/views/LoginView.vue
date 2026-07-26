<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2>IT 服务台管理端</h2>
      <p>选择测试账号登录</p>
      <div class="accounts">
        <el-button type="primary" @click="login('emp001')">员工 · 张三</el-button>
        <el-button type="success" @click="login('tech001')">技术员 · 李四</el-button>
        <el-button type="warning" @click="login('admin001')">管理员 · 王五</el-button>
        <el-button @click="wecomLogin">企业微信扫码登录</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

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
  router.push('/dashboard');
}

async function wecomLogin() {
  const res = await fetch(`${API_BASE}/api/wecom/oauth/admin-url`);
  const { url } = await res.json();
  window.location.href = url;
}
</script>

<style scoped>
.login-wrap {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.login-card {
  width: 360px;
  text-align: center;
}
.accounts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
</style>
