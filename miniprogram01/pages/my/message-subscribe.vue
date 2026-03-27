<template>
  <view class="page">
    <view class="section-title">审核结果通知</view>
    <view class="card">
      <view class="row">
        <text class="label">接收审核结果订阅消息</text>
        <u-switch v-model="enabled" />
      </view>
      <text class="hint">仅在您主动同意订阅后才会推送通知</text>
    </view>

    <u-button type="primary" text="前往订阅" size="large" @click="handleSubscribe" />
  </view>
</template>

<script setup>
import { ref } from 'vue'

const enabled = ref(false)

const handleSubscribe = () => {
  uni.showToast({ title: '请在提交申报后订阅', icon: 'none' })
}
</script>

<style scoped>
.card {
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-size: 16px;
}

.hint {
  font-size: 12px;
  color: #94a3b8;
}
</style>
