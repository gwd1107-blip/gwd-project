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
        @click="categoryPicker = true"
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
      <van-picker
        :columns="categoryColumns"
        @confirm="onCategoryConfirm"
        @cancel="categoryPicker = false"
      />
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
  Picker as VanPicker,
  Popup as VanPopup,
  Radio as VanRadio,
  RadioGroup as VanRadioGroup,
} from 'vant';
import { api } from '../api';

const router = useRouter();
const categories = ref<{ id: number; name: string; children: { id: number; name: string }[] }[]>([]);
const categoryPicker = ref(false);
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

const categoryColumns = computed(() =>
  categories.value.map((p) => ({
    text: p.name,
    value: p.id,
    children: p.children.map((c) => ({ text: c.name, value: c.id })),
  })),
);

const categoryText = computed(() => {
  for (const p of categories.value) {
    const c = p.children.find((x) => x.id === form.value.categoryId);
    if (c) return `${p.name} / ${c.name}`;
  }
  return '';
});

function onCategoryConfirm({ selectedOptions }: { selectedOptions: { value: number }[] }) {
  form.value.categoryId = selectedOptions[selectedOptions.length - 1].value;
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
</style>
