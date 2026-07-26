<template>
  <div class="notifications-page">
    <van-nav-bar title="消息" left-text="返回" left-arrow @click-left="router.push('/home')">
      <template #right>
        <span @click="markAll">全部已读</span>
      </template>
    </van-nav-bar>
    <van-cell
      v-for="n in notifications"
      :key="n.id"
      :title="n.title"
      :label="`${n.content} · ${new Date(n.createdAt).toLocaleString()}`"
      :class="{ unread: !n.read }"
      is-link
      @click="markRead(n)"
    />
    <van-empty v-if="notifications.length === 0" description="暂无消息" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Cell as VanCell, Empty as VanEmpty, NavBar as VanNavBar } from 'vant';
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
.notifications-page {
  padding-bottom: 24px;
}
.unread :deep(.van-cell__title) {
  font-weight: bold;
}
</style>
