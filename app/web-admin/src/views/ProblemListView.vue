<template>
  <el-container>
    <el-header>
      <h3>问题管理</h3>
      <el-button link @click="router.push('/dashboard')">返回工作台</el-button>
    </el-header>
    <el-main>
      <el-row :gutter="16" class="kanban">
        <el-col :span="6" v-for="col in columns" :key="col.key">
          <h4>{{ col.label }} ({{ col.items.length }})</h4>
          <el-card
            v-for="p in col.items"
            :key="p.id"
            class="problem-card"
            @click="openDetail(p)"
          >
            <div class="card-title">{{ p.title }}</div>
            <div class="card-meta">{{ p.symptom }}</div>
            <div class="card-meta">关联事件 {{ p.incidents?.length || 0 }}</div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <el-drawer v-model="drawer" :title="`问题 #${selected?.id}`" size="50%">
      <div v-if="selected">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="标题">{{ selected.title }}</el-descriptions-item>
          <el-descriptions-item label="症状">{{ selected.symptom }}</el-descriptions-item>
          <el-descriptions-item label="根因">{{ selected.rootCause || '-' }}</el-descriptions-item>
          <el-descriptions-item label="临时方案">{{ selected.workaround || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最终方案">{{ selected.finalSolution || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="problemStatusType[selected.status]">{{ problemStatusText[selected.status] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="关联事件">
            <div v-for="i in selected.incidents" :key="i.id">
              <el-link type="primary" @click="goTicket(i.ticketId)">
                {{ i.ticket?.ticketNo }}（{{ i.ticket?.title }}）
              </el-link>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="actions" v-if="canOperate">
          <el-button
            v-if="selected.status !== 'RESOLVED' && selected.status !== 'KNOWN_ERROR'"
            @click="markKnownError"
          >
            标记已知错误
          </el-button>
          <el-button v-if="selected.status !== 'RESOLVED'" type="primary" @click="openResolve">
            解决并级联关闭
          </el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="resolveDialog" title="解决问题" width="400px">
      <el-input v-model="finalSolution" type="textarea" rows="3" placeholder="填写最终解决方案" />
      <template #footer>
        <el-button @click="resolveDialog = false">取消</el-button>
        <el-button type="primary" @click="resolve">确定</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { problemStatusText, problemStatusType } from '../utils';

const router = useRouter();
const problems = ref<any[]>([]);
const user = ref<any>(null);
const drawer = ref(false);
const selected = ref<any>(null);
const resolveDialog = ref(false);
const finalSolution = ref('');

onMounted(async () => {
  const me = await api('/api/users/me');
  user.value = await me.json();
  await load();
});

const canOperate = computed(() => user.value && user.value.role !== 'EMPLOYEE');

const columns = computed(() => {
  const keys = ['INVESTIGATING', 'ROOT_CAUSE_FOUND', 'KNOWN_ERROR', 'RESOLVED'];
  return keys.map((k) => ({
    key: k,
    label: problemStatusText[k],
    items: problems.value.filter((p) => p.status === k),
  }));
});

async function load() {
  const res = await api('/api/problems');
  problems.value = await res.json();
}

function openDetail(p: any) {
  selected.value = p;
  drawer.value = true;
}

async function refreshSelected() {
  if (!selected.value) return;
  const res = await api(`/api/problems/${selected.value.id}`);
  selected.value = await res.json();
  await load();
}

async function markKnownError() {
  await api(`/api/problems/${selected.value.id}/mark-known-error`, { method: 'POST' });
  await refreshSelected();
}

function openResolve() {
  finalSolution.value = '';
  resolveDialog.value = true;
}

async function resolve() {
  await api(`/api/problems/${selected.value.id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ finalSolution: finalSolution.value }),
  });
  resolveDialog.value = false;
  await refreshSelected();
}

function goTicket(ticketId: number) {
  router.push(`/tickets`);
  // R3 列表页不支持直接定位到某个工单，先跳列表
  void ticketId;
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
.kanban h4 {
  margin: 0 0 12px;
  color: #333;
}
.problem-card {
  margin-bottom: 12px;
  cursor: pointer;
}
.card-title {
  font-weight: bold;
  margin-bottom: 4px;
}
.card-meta {
  color: #666;
  font-size: 12px;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
</style>
