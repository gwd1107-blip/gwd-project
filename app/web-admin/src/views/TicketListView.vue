<template>
  <el-container>
    <el-header>
      <h3>工单列表</h3>
      <el-button link @click="router.push('/dashboard')">返回工作台</el-button>
    </el-header>
    <el-main>
      <el-table :data="tickets" @row-click="openDetail" highlight-current-row>
        <el-table-column prop="ticketNo" label="单号" width="160" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="requesterUserid" label="请求人" width="120" />
        <el-table-column prop="agentUserid" label="处理人" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="80">
          <template #default="{ row }">
            {{ row.priority ? priorityText[row.priority] : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">{{ new Date(row.createdAt).toLocaleString() }}</template>
        </el-table-column>
      </el-table>
    </el-main>

    <el-drawer v-model="drawer" :title="`工单 ${selected?.ticketNo}`" size="50%">
      <div v-if="selected">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题">{{ selected.title }}</el-descriptions-item>
          <el-descriptions-item label="请求人">{{ selected.requesterUserid }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ selected.agentUserid || '未指派' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType[selected.status]">{{ statusText[selected.status] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">{{ selected.priority ? priorityText[selected.priority] : '-' }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ selected.description }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="mt">处理记录</h4>
        <el-timeline>
          <el-timeline-item v-for="e in selected.events" :key="e.id" :timestamp="new Date(e.createdAt).toLocaleString()">
            {{ actionText(e.action) }}
            <p v-if="e.comment" class="comment">{{ e.comment }}</p>
          </el-timeline-item>
        </el-timeline>

        <div class="reply-box" v-if="canOperate">
          <el-input v-model="replyText" type="textarea" rows="2" placeholder="输入回复内容" />
          <el-button type="primary" @click="reply">回复</el-button>
        </div>

        <div class="actions" v-if="canOperate">
          <el-button v-if="selected.status === 'PENDING'" @click="openAssign">接单/指派</el-button>
          <el-button v-if="selected.status === 'IN_PROGRESS'" @click="openResolve">标记解决</el-button>
          <el-button v-if="selected.status === 'IN_PROGRESS'" @click="openSuspend">挂起</el-button>
          <el-button v-if="selected.status === 'SUSPENDED'" @click="resume">恢复</el-button>
          <el-button v-if="selected.status === 'WAITING_CONFIRM'" @click="reject">打回</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="assignDialog" title="接单/指派" width="360px">
      <el-form label-width="80px">
        <el-form-item label="处理人">
          <el-input v-model="assignForm.agentUserid" />
        </el-form-item>
        <el-form-item label="影响面">
          <el-select v-model="assignForm.impact">
            <el-option label="仅我" value="ONLY_ME" />
            <el-option label="多人" value="SEVERAL" />
            <el-option label="全公司" value="ALL" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialog = false">取消</el-button>
        <el-button type="primary" @click="assign">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resolveDialog" title="标记解决" width="400px">
      <el-input v-model="resolveForm.solution" type="textarea" rows="3" placeholder="填写解决方案" />
      <template #footer>
        <el-button @click="resolveDialog = false">取消</el-button>
        <el-button type="primary" @click="resolve">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reasonDialog" title="原因" width="360px">
      <el-input v-model="reasonForm.reason" type="textarea" rows="2" placeholder="填写原因" />
      <template #footer>
        <el-button @click="reasonDialog = false">取消</el-button>
        <el-button type="primary" @click="reasonConfirm">确定</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { statusText, statusType, priorityText } from '../utils';

const router = useRouter();
const tickets = ref<any[]>([]);
const user = ref<any>(null);
const drawer = ref(false);
const selected = ref<any>(null);
const replyText = ref('');

const assignDialog = ref(false);
const assignForm = ref({ agentUserid: '', impact: 'ONLY_ME' });
const resolveDialog = ref(false);
const resolveForm = ref({ solution: '' });
const reasonDialog = ref(false);
const reasonForm = ref({ reason: '' });
let reasonAction: 'suspend' | 'reject' | null = null;

onMounted(async () => {
  const me = await api('/api/users/me');
  user.value = await me.json();
  await load();
});

const canOperate = computed(() => user.value && user.value.role !== 'EMPLOYEE');

async function load() {
  const res = await api('/api/tickets');
  tickets.value = await res.json();
}

function openDetail(row: any) {
  selected.value = row;
  drawer.value = true;
}

function actionText(action: string) {
  const map: Record<string, string> = {
    CREATE: '创建', ASSIGN: '指派', REPLY: '回复', SUSPEND: '挂起',
    RESOLVE: '解决', CLOSE: '关闭', CANCEL: '取消', TRANSFER: '转交',
    RESUME: '恢复', REJECT: '打回',
  };
  return map[action] ?? action;
}

async function refreshSelected() {
  if (!selected.value) return;
  const res = await api(`/api/tickets/${selected.value.id}`);
  selected.value = await res.json();
  await load();
}

async function reply() {
  await api(`/api/tickets/${selected.value.id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ comment: replyText.value }),
  });
  replyText.value = '';
  await refreshSelected();
}

function openAssign() {
  assignForm.value = { agentUserid: user.value?.userid || '', impact: 'ONLY_ME' };
  assignDialog.value = true;
}

async function assign() {
  await api(`/api/tickets/${selected.value.id}/assign`, {
    method: 'POST',
    body: JSON.stringify(assignForm.value),
  });
  assignDialog.value = false;
  await refreshSelected();
}

function openResolve() {
  resolveForm.value.solution = '';
  resolveDialog.value = true;
}

async function resolve() {
  await api(`/api/tickets/${selected.value.id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(resolveForm.value),
  });
  resolveDialog.value = false;
  await refreshSelected();
}

function openSuspend() {
  reasonAction = 'suspend';
  reasonForm.value.reason = '';
  reasonDialog.value = true;
}

async function resume() {
  await api(`/api/tickets/${selected.value.id}/resume`, { method: 'POST' });
  await refreshSelected();
}

function reject() {
  reasonAction = 'reject';
  reasonForm.value.reason = '';
  reasonDialog.value = true;
}

async function reasonConfirm() {
  const id = selected.value.id;
  if (reasonAction === 'suspend') {
    await api(`/api/tickets/${id}/suspend`, { method: 'POST', body: JSON.stringify(reasonForm.value) });
  } else if (reasonAction === 'reject') {
    await api(`/api/tickets/${id}/reject`, { method: 'POST', body: JSON.stringify(reasonForm.value) });
  }
  reasonDialog.value = false;
  await refreshSelected();
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
.mt { margin-top: 16px; }
.comment { color: #666; margin: 4px 0 0; }
.reply-box { display: flex; gap: 8px; margin-top: 16px; }
.actions { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
</style>
