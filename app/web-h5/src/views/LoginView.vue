<template>
  <div class="login-page">
    <h1>IT 服务台</h1>
    <p>企业微信免密登录</p>
    <van-button type="primary" block @click="enter">模拟进入（R7 接企微）</van-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button as VanButton } from 'vant';

const router = useRouter();
const enter = () => router.push('/home');
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
</style>
