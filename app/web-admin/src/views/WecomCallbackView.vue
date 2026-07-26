<template>
  <div class="callback">登录中...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const token = route.query.token as string;
  if (token) {
    localStorage.setItem('itsm_token', token);
    router.replace('/dashboard');
  } else {
    router.replace('/login');
  }
});
</script>
