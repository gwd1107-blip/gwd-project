<template>
  <div class="detail-page">
    <van-nav-bar title="工单详情" left-text="返回" left-arrow @click-left="router.back" />
    <van-cell-group v-if="ticket" inset>
      <van-cell title="单号" :value="ticket.ticketNo" />
      <van-cell title="标题" :value="ticket.title" />
      <van-cell title="状态" :value="statusText(ticket.status)" />
      <van-cell title="优先级" :value="ticket.priority ? priorityText(ticket.priority) : '-'" />
      <van-cell title="处理人" :value="ticket.agentUserid || '未指派'" />
    </van-cell-group>

    <div class="section" v-if="events.length">
      <h4>处理记录</h4>
      <van-steps direction="vertical" :active="events.length">
        <van-step v-for="e in events" :key="e.id">
          <h5>{{ actionText(e.action) }}</h5>
          <p>{{ e.comment || '' }}</p>
          <p class="time">{{ new Date(e.createdAt).toLocaleString() }}</p>
        </van-step>
      </van-steps>
    </div>

    <div class="actions" v-if="ticket">
      <van-button v-if="ticket.status === 'WAITING_CONFIRM'" type="primary" block @click="close">
        确认关闭
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button as VanButton,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  NavBar as VanNavBar,
  Step as VanStep,
  Steps as VanSteps,
} from 'vant';
import { api } from '../api';
import { statusText, priorityText } from '../utils';

const route = useRoute();
const router = useRouter();
const ticket = ref<any>(null);
const events = ref<any[]>([]);

onMounted(load);

async function load() {
  const id = route.params.id;
  const res = await api(`/api/tickets/${id}`);
  const data = await res.json();
  ticket.value = data;
  events.value = data.events || [];
}

function actionText(action: string) {
  const map: Record<string, string> = {
    CREATE: '创建工单',
    ASSIGN: '接单/指派',
    REPLY: '回复',
    SUSPEND: '挂起',
    RESOLVE: '标记已解决',
    CLOSE: '关闭工单',
    CANCEL: '取消工单',
    TRANSFER: '转交',
    RESUME: '恢复处理',
    REJECT: '打回处理',
  };
  return map[action] ?? action;
}

async function close() {
  await api(`/api/tickets/${ticket.value.id}/close`, { method: 'POST' });
  await load();
}
</script>

<style scoped>
.detail-page {
  padding-bottom: 24px;
}
.section {
  padding: 16px;
}
.section h4 {
  margin-bottom: 12px;
}
.time {
  color: #999;
  font-size: 12px;
}
.actions {
  padding: 24px;
}
.rate {
  text-align: center;
}
</style>
