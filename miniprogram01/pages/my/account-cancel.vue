<template>
  <view class="page">
    <view class="section-title">账号注销</view>
    <view class="card">
      <text class="warning">注销后，您的个人信息与业务数据将在 7 个工作日内删除或匿名化处理。</text>
      <text class="hint">请确认您已知悉以上影响。</text>
    </view>
    <u-button type="error" text="确认注销" size="large" @click="confirmCancel" />
  </view>
</template>

<script setup>
const confirmCancel = () => {
  uni.showModal({
    title: '确认注销',
    content: '确认提交注销申请吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已提交注销申请', icon: 'none' })
      }
    }
  })
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

.warning {
  font-size: 16px;
  color: #ef4444;
  font-weight: 600;
}

.hint {
  font-size: 12px;
  color: #94a3b8;
}
</style>
