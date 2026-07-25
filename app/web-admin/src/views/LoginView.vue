<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2>IT 服务台管理端</h2>
      <p>企业微信扫码登录（R7 接入）</p>
      <el-button type="primary" @click="enter">模拟进入</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const enter = () => router.push('/dashboard');
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
</style>
