<template>
  <div class="home-page">
    <h2>工作台</h2>
    <p v-if="user">{{ user.name }} · {{ roleText(user.role) }}</p>
    <div class="actions">
      <van-button type="primary" block>我要提单</van-button>
      <van-button type="success" block>查知识</van-button>
      <van-button type="warning" block>已知问题</van-button>
      <van-button type="danger" block>待我处理 (0)</van-button>
      <van-button plain block @click="logout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Button as VanButton } from 'vant';

const router = useRouter();
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const user = ref<{ name: string; role: string } | null>(null);

onMounted(async () => {
  const token = localStorage.getItem('itsm_token');
  if (!token) {
    router.replace('/login');
    return;
  }
  const res = await fetch(`${API_BASE}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    logout();
    return;
  }
  user.value = await res.json();
});

function roleText(role: string) {
  const map: Record<string, string> = { EMPLOYEE: '员工', TECHNICIAN: '技术员', ADMIN: '管理员' };
  return map[role] ?? role;
}

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
