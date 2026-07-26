<template>
  <el-container>
    <el-header>
      <h3>消息通知</h3>
      <el-button link @click="router.push('/dashboard')">返回工作台</el-button>
    </el-header>
    <el-main>
      <el-table :data="notifications" @row-click="markRead" highlight-current-row>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.read ? 'info' : 'danger'">{{ row.read ? '已读' : '未读' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="content" label="内容" />
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">{{ new Date(row.createdAt).toLocaleString() }}</template>
        </el-table-column>
      </el-table>
      <el-button style="margin-top: 16px" @click="markAll">全部标记已读</el-button>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const notifications = ref<any[]>([]);

onMounted(load);

async function load() {
  const res = await api('/api/notifications');
  notifications.value = await res.json();
}

async function markRead(n: any) {
  if (n.read) return;
  await api(`/api/notifications/${n.id}/read`, { method: 'POST' });
  n.read = true;
}

async function markAll() {
  await api('/api/notifications/read-all', { method: 'POST' });
  notifications.value.forEach((n) => (n.read = true));
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
