<template>
  <div class="list-page">
    <van-nav-bar title="我的工单" left-text="返回" left-arrow @click-left="router.back" />
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
    <van-empty v-if="tickets.length === 0" description="暂无工单" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Cell as VanCell, Empty as VanEmpty, NavBar as VanNavBar, Tag as VanTag } from 'vant';
import { api } from '../api';
import { statusText } from '../utils';

const router = useRouter();
const tickets = ref<any[]>([]);

onMounted(async () => {
  const res = await api('/api/tickets');
  tickets.value = await res.json();
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
