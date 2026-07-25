<template>
  <div class="kb-page">
    <van-nav-bar title="知识库" left-text="返回" left-arrow @click-left="router.push('/home')" />
    <van-search v-model="query" placeholder="搜索知识或已知问题" @search="search" />
    <van-tabs v-model:active="tab" @change="load">
      <van-tab title="知识文章" name="articles" />
      <van-tab title="已知问题" name="known" />
    </van-tabs>

    <div v-if="loading" class="status">加载中...</div>
    <template v-else>
      <van-cell
        v-for="item in items"
        :key="item.id"
        :title="item.title"
        :label="item.content || item.symptom"
        is-link
        @click="open(item)"
      />
      <van-empty v-if="items.length === 0" description="暂无内容" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Cell as VanCell, Empty as VanEmpty, NavBar as VanNavBar, Search as VanSearch, Tab as VanTab, Tabs as VanTabs } from 'vant';
import { api } from '../api';

const router = useRouter();
const query = ref('');
const tab = ref('articles');
const items = ref<any[]>([]);
const loading = ref(false);

onMounted(load);

async function load() {
  loading.value = true;
  try {
    if (tab.value === 'articles') {
      const url = query.value ? `/api/kb/articles/search?q=${encodeURIComponent(query.value)}` : '/api/kb/articles';
      const res = await api(url);
      items.value = await res.json();
    } else {
      const res = await api('/api/problems/known');
      items.value = await res.json();
    }
  } finally {
    loading.value = false;
  }
}

function search() {
  load();
}

function open(item: any) {
  // R5 简化：列表即可查看内容摘要；文章详情页后续可加
  alert(item.content || item.workaround || item.symptom);
}
</script>

<style scoped>
.kb-page {
  padding-bottom: 24px;
}
.status {
  padding: 48px 24px;
  text-align: center;
  color: #666;
}
</style>
