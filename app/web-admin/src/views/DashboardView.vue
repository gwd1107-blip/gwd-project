<template>
  <el-container class="dashboard">
    <el-header>
      <h3>IT 服务台 · 管理端</h3>
      <el-button link @click="logout">退出</el-button>
    </el-header>
    <el-main>
      <el-card v-if="user" style="margin-bottom: 16px">
        当前用户：{{ user.name }} · {{ roleText(user.role) }}
      </el-card>
      <el-row :gutter="16">
        <el-col :span="8"><el-card>我的待办 0</el-card></el-col>
        <el-col :span="8"><el-card>今日新单 0</el-card></el-col>
        <el-col :span="8"><el-card>超时单 0</el-card></el-col>
      </el-row>
      <el-card class="mt" style="margin-top: 16px">
        <p>工单列表（R2/R3 填充）</p>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

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
.el-header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
}
</style>
