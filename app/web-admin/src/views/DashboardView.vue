<template>
  <el-container class="dashboard">
    <el-header>
      <h3>IT 服务台 · 管理端</h3>
      <div>
        <span v-if="user">{{ user.name }} · {{ user.role }}</span>
        <el-button link @click="logout">退出</el-button>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="16">
        <el-col :span="8"><el-card>我的待办 {{ stats.todo }}</el-card></el-col>
        <el-col :span="8"><el-card>今日新单 {{ stats.today }}</el-card></el-col>
        <el-col :span="8"><el-card>超时单 {{ stats.overdue }}</el-card></el-col>
      </el-row>
      <el-card style="margin-top: 16px">
        <el-button type="primary" @click="router.push('/tickets')">进入工单列表</el-button>
        <el-button @click="router.push('/problems')" style="margin-left: 12px">进入问题管理</el-button>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const user = ref<any>(null);
const stats = ref({ todo: 0, today: 0, overdue: 0 });

onMounted(async () => {
  const me = await api('/api/users/me');
  user.value = await me.json();
  const res = await api('/api/tickets');
  const tickets: any[] = await res.json();
  const today = new Date().toDateString();
  stats.value = {
    todo: tickets.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
    today: tickets.filter((t) => new Date(t.createdAt).toDateString() === today).length,
    overdue: tickets.filter((t) => t.resolveDeadline && new Date(t.resolveDeadline) < new Date()).length,
  };
});

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
