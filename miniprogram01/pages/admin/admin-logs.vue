<template>
  <view class="page">
    <view class="section-title">操作日志</view>
    <u-list>
      <u-cell
        v-for="log in logs"
        :key="log.id"
        :title="log.action"
        :label="`${log.operator} | ${log.time}`"
      />
    </u-list>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const logs = ref([
  { id: '1', operator: '管理员A', time: '2026-03-20 10:20', action: '批量导入数据' },
  { id: '2', operator: '管理员B', time: '2026-03-18 16:00', action: '审核通过志愿服务' }
])
</script>

<style scoped>
</style>
