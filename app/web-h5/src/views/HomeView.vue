<template>
  <div class="home-page">
    <h2>工作台</h2>
    <p v-if="user">{{ user.name }} · {{ roleText[user.role] }}</p>
    <div class="actions">
      <van-button type="primary" block @click="router.push('/tickets/create')">我要提单</van-button>
      <van-button type="success" block @click="router.push('/tickets')">我的工单</van-button>
      <van-button type="warning" block>已知问题</van-button>
      <van-button type="danger" block v-if="user?.role !== 'EMPLOYEE'">待我处理</van-button>
      <van-button plain block @click="logout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Button as VanButton } from 'vant';
import { api } from '../api';
import { roleText } from '../utils';

const router = useRouter();
const user = ref<{ name: string; role: string } | null>(null);

onMounted(async () => {
  const res = await api('/api/users/me');
  user.value = await res.json();
});

function logout() {
  localStorage.removeItem('itsm_token');
  localStorage.removeItem('itsm_user');
  router.replace('/login');
}
</script>

<style scoped>
.home-page {
  padding: 24px;
}
h2 {
  margin-bottom: 8px;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}
</style>
