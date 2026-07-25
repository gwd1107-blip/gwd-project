<template>
  <div class="create-page">
    <van-nav-bar title="我要提单" left-text="返回" left-arrow @click-left="router.push('/home')" />
    <van-cell-group inset>
      <van-field
        v-model="form.title"
        label="标题"
        placeholder="一句话描述问题"
        :rules="[{ required: true }]"
      />
      <van-field
        v-model="form.description"
        label="详细描述"
        type="textarea"
        rows="3"
        placeholder="发生了什么、已尝试的解决办法"
      />
      <div v-if="recommendations.articles.length || recommendations.knownErrors.length" class="recommend-box">
        <p class="recommend-title">为您找到相关内容：</p>
        <div v-for="a in recommendations.articles" :key="'a' + a.id" class="recommend-item">
          <span class="recommend-text">📘 {{ a.title }}</span>
          <van-button size="small" type="primary" plain @click="resolveByArticle(a)">解决了</van-button>
        </div>
        <div v-for="k in recommendations.knownErrors" :key="'k' + k.id" class="recommend-item">
          <span class="recommend-text">⚠️ {{ k.title }}（已知问题）</span>
          <van-button size="small" type="warning" plain @click="resolveByProblem(k)">我也遇到了</van-button>
        </div>
      </div>
      <van-field
        v-model="categoryText"
        label="问题分类"
        placeholder="请选择"
        readonly
        @click="openCategoryPicker"
      />
      <van-cell title="紧急程度">
        <template #right-icon>
          <van-radio-group v-model="form.urgency" direction="horizontal">
            <van-radio name="LOW">不紧急</van-radio>
            <van-radio name="MEDIUM">有点急</van-radio>
            <van-radio name="HIGH">很急</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
    </van-cell-group>
    <div class="submit">
      <van-button type="primary" block @click="submit">提交工单</van-button>
    </div>

    <van-popup v-model:show="categoryPicker" round position="bottom" :style="{ height: '60%' }">
      <div class="category-popup">
        <div class="category-title">
          <span v-if="step === 'child'" @click="step = 'parent'">← 返回大类</span>
          <span v-else>选择问题分类</span>
          <span class="close" @click="categoryPicker = false">关闭</span>
        </div>

        <div v-if="step === 'parent'" class="category-grid">
          <van-button
            v-for="p in categories"
            :key="p.id"
            :type="pickerParent === p.id ? 'primary' : 'default'"
            block
            @click="selectParent(p.id)"
          >
            {{ p.name }}
          </van-button>
        </div>

        <div v-else class="category-grid">
          <p class="parent-hint">{{ parentName }}</p>
          <van-button
            v-for="c in childOptions"
            :key="c.id"
            :type="pickerChild === c.id ? 'primary' : 'default'"
            block
            @click="selectChild(c.id)"
          >
            {{ c.name }}
          </van-button>
        </div>

        <div class="category-confirm">
          <van-button type="primary" block :disabled="!pickerChild" @click="confirmCategory">
            确定
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  Button as VanButton,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Field as VanField,
  NavBar as VanNavBar,
  Popup as VanPopup,
  Radio as VanRadio,
  RadioGroup as VanRadioGroup,
} from 'vant';
import { api } from '../api';

const router = useRouter();
const categories = ref<{ id: number; name: string; children: { id: number; name: string }[] }[]>([]);
const categoryPicker = ref(false);
const step = ref<'parent' | 'child'>('parent');
const pickerParent = ref<number | null>(null);
const pickerChild = ref<number | null>(null);
const form = ref({
  title: '',
  description: '',
  categoryId: null as number | null,
  urgency: 'MEDIUM',
});

const recommendations = ref<{ articles: any[]; knownErrors: any[] }>({ articles: [], knownErrors: [] });
let recommendTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  const res = await api('/api/categories');
  categories.value = await res.json();
});

watch(
  () => form.value.description,
  (val) => {
    if (recommendTimer) clearTimeout(recommendTimer);
    if (!val || val.trim().length < 3) {
      recommendations.value = { articles: [], knownErrors: [] };
      return;
    }
    recommendTimer = setTimeout(async () => {
      const res = await api(`/api/kb/articles/recommend?q=${encodeURIComponent(val)}`);
      recommendations.value = await res.json();
    }, 400);
  },
);

function resolveByArticle(article: any) {
  alert(`【${article.title}】\n\n${article.content}`);
  resetForm();
}

function resolveByProblem(problem: any) {
  alert(`已知问题：${problem.title}\n临时方案：${problem.workaround || '暂无'}\nIT 正在处理中`);
  resetForm();
}

function resetForm() {
  form.value.title = '';
  form.value.description = '';
  form.value.categoryId = null;
  recommendations.value = { articles: [], knownErrors: [] };
}

const childOptions = computed(() => {
  const parent = categories.value.find((p) => p.id === pickerParent.value);
  return parent?.children ?? [];
});

const parentName = computed(() => {
  return categories.value.find((p) => p.id === pickerParent.value)?.name ?? '';
});

const categoryText = computed(() => {
  for (const p of categories.value) {
    const c = p.children.find((x) => x.id === form.value.categoryId);
    if (c) return `${p.name} / ${c.name}`;
  }
  return '';
});

function openCategoryPicker() {
  const currentParent = categories.value.find((p) => p.children.some((c) => c.id === form.value.categoryId));
  pickerParent.value = currentParent?.id ?? null;
  pickerChild.value = form.value.categoryId;
  step.value = pickerParent.value ? 'child' : 'parent';
  categoryPicker.value = true;
}

function selectParent(id: number) {
  pickerParent.value = id;
  pickerChild.value = null;
  step.value = 'child';
}

function selectChild(id: number) {
  pickerChild.value = id;
}

function confirmCategory() {
  form.value.categoryId = pickerChild.value;
  categoryPicker.value = false;
}

async function submit() {
  if (!form.value.title || !form.value.categoryId) {
    alert('请填写标题和分类');
    return;
  }
  const res = await api('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(form.value),
  });
  const ticket = await res.json();
  router.push(`/tickets/${ticket.id}`);
}
</script>

<style scoped>
.create-page {
  padding-bottom: 24px;
}
.submit {
  padding: 24px;
}
.category-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}
.category-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
}
.category-title .close {
  color: #666;
}
.category-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}
.parent-hint {
  color: #666;
  margin: 0;
}
.category-confirm {
  margin-top: 16px;
}
.recommend-box {
  margin: 8px 0;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}
.recommend-title {
  margin: 0 0 8px;
  color: #666;
  font-size: 13px;
}
.recommend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.recommend-item:last-child {
  margin-bottom: 0;
}
.recommend-text {
  flex: 1;
  margin-right: 8px;
  font-size: 13px;
}
</style>
