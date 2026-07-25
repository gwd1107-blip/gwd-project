<template>
  <div class="create-page">
    <van-nav-bar title="我要提单" left-text="返回" left-arrow @click-left="router.back" />
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

    <van-popup v-model:show="categoryPicker" round position="bottom">
      <div class="category-popup">
        <div class="category-header">
          <span @click="categoryPicker = false">取消</span>
          <span class="ok" @click="confirmCategory">确定</span>
        </div>
        <div class="category-row">
          <label>大类</label>
          <select v-model="pickerParent" @change="pickerChild = null">
            <option v-for="p in categories" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div class="category-row">
          <label>小类</label>
          <select v-model="pickerChild">
            <option v-for="c in childOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
const pickerParent = ref<number | null>(null);
const pickerChild = ref<number | null>(null);
const form = ref({
  title: '',
  description: '',
  categoryId: null as number | null,
  urgency: 'MEDIUM',
});

onMounted(async () => {
  const res = await api('/api/categories');
  categories.value = await res.json();
});

const childOptions = computed(() => {
  const parent = categories.value.find((p) => p.id === pickerParent.value);
  return parent?.children ?? [];
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
  pickerParent.value = currentParent?.id ?? (categories.value[0]?.id ?? null);
  pickerChild.value = form.value.categoryId;
  categoryPicker.value = true;
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
  padding: 16px;
}
.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  color: #666;
}
.category-header .ok {
  color: #1989fa;
}
.category-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.category-row label {
  width: 48px;
}
.category-row select {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ebedf0;
  border-radius: 4px;
}
</style>
