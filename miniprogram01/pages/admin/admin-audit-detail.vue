<template>
  <view class="page">
    <view class="detail-card">
      <text class="detail-title">审核详情</text>
      <view class="detail-item">
        <text class="label">用户姓名</text>
        <text class="value">张三</text>
      </view>
      <view class="detail-item">
        <text class="label">申报内容</text>
        <text class="value">红色宣讲活动</text>
      </view>
      <view class="detail-item">
        <text class="label">申报积分</text>
        <text class="value">8 分</text>
      </view>
      <view class="detail-item">
        <text class="label">提交时间</text>
        <text class="value">2026-03-20 10:30</text>
      </view>
    </view>

    <view class="action-group">
      <u-button type="primary" text="通过" size="large" @click="approve" />
      <u-button type="warning" text="驳回" size="large" @click="reject" />
    </view>
  </view>
</template>

<script setup>
const approve = () => {
  uni.showToast({ title: '已通过审核', icon: 'none' })
}

const reject = () => {
  uni.showModal({
    title: '驳回原因',
    content: '请在后台填写驳回原因',
    showCancel: false
  })
}
</script>

<style scoped>
.detail-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.label {
  color: #64748b;
}

.value {
  color: #1f2937;
  flex: 1;
  text-align: right;
}

.action-group {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
