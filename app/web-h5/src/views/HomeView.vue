<template>
  <div class="home-page">
    <h2>工作台</h2>
    <div class="actions">
      <van-button type="primary" block>我要提单</van-button>
      <van-button type="success" block>查知识</van-button>
      <van-button type="warning" block>已知问题</van-button>
      <van-button type="danger" block>待我处理 (0)</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button as VanButton } from 'vant';
</script>

<style scoped>
.home-page {
  padding: 24px;
}
h2 {
  margin-bottom: 24px;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
