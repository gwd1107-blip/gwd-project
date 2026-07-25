<template>
  <div class="list-page">
    <van-nav-bar title="我的工单" left-text="返回" left-arrow @click-left="router.push('/home')" />
    <div v-if="loading" class="status">加载中...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <template v-else>
      <van-cell-group v-if="tickets.length" inset>
        <van-cell
          v-for="t in tickets"
          :key="t.id"
          :title="t.title"
          :label="`${t.ticketNo} · ${statusText(t.status)}`"
          is-link
          @click="router.push(`/tickets/${t.id}`)"
        >
          <template #right-icon>
            <van-tag :type="tagType(t.status)">{{ statusText(t.status) }}</van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      <van-empty v-else description="暂无工单" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Empty as VanEmpty,
  NavBar as VanNavBar,
  Tag as VanTag,
} from 'vant';
import { api } from '../api';
import { statusText } from '../utils';

const router = useRouter();
const tickets = ref<any[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const res = await api('/api/tickets');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tickets.value = await res.json();
  } catch (e: any) {
    error.value = '加载失败：' + (e.message || '未知错误');
  } finally {
    loading.value = false;
  }
});

function tagType(status: string) {
  const map: Record<string, string> = {
    PENDING: 'default',
    IN_PROGRESS: 'primary',
    WAITING_CONFIRM: 'warning',
    CLOSED: 'success',
    SUSPENDED: 'danger',
    CANCELLED: 'danger',
  };
  return (map[status] ?? 'default') as any;
}
</script>

<style scoped>
.status {
  padding: 48px 24px;
  text-align: center;
  color: #666;
}
.error {
  color: #ee0a24;
}
</style>
