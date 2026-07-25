<template>
  <el-container class="dashboard">
    <el-header><h3>IT 服务台 · 管理端</h3></el-header>
    <el-main>
      <el-row :gutter="16">
        <el-col :span="8"><el-card>我的待办 0</el-card></el-col>
        <el-col :span="8"><el-card>今日新单 0</el-card></el-col>
        <el-col :span="8"><el-card>超时单 0</el-card></el-col>
      </el-row>
      <el-card class="mt" style="margin-top: 16px">
        <p>工单列表（R2/R3 填充）</p>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup lang="ts"></script>

<style scoped>
.el-header {
  background: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
}
</style>
