<template>
  <view class="page">
    <view class="section-title">全量数据导出</view>
    <u-form :model="form" labelPosition="top">
      <u-form-item label="年度">
        <u-input v-model="form.year" placeholder="如 2026" />
      </u-form-item>
      <u-form-item label="模块 / 荣誉级别">
        <u-input v-model="form.module" placeholder="如 传承红色文化" />
      </u-form-item>
      <u-form-item label="审核状态">
        <u-input v-model="form.status" placeholder="如 已审核" />
      </u-form-item>
      <u-form-item label="用户姓名 / 身份证号">
        <u-input v-model="form.keyword" placeholder="请输入关键词" />
      </u-form-item>
    </u-form>

    <view class="action-group">
      <u-button type="primary" text="导出 Excel" size="large" @click="handleExport" />
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  year: '',
  module: '',
  status: '',
  keyword: ''
})

const handleExport = () => {
  uni.showToast({ title: '导出接口待接入', icon: 'none' })
}
</script>

<style scoped>
.action-group {
  margin-top: 24px;
}
</style>
