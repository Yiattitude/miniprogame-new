<template>
  <view class="page">
    <view class="detail-card">
      <text class="detail-title">志愿服务记录详情</text>
      <view class="detail-item">
        <text class="label">活动名称</text>
        <text class="value">社区义诊志愿服务</text>
      </view>
      <view class="detail-item">
        <text class="label">活动时间</text>
        <text class="value">2026-03-01 09:30</text>
      </view>
      <view class="detail-item">
        <text class="label">活动地点</text>
        <text class="value">社区卫生服务中心</text>
      </view>
      <view class="detail-item">
        <text class="label">参与内容</text>
        <text class="value">协助义诊、健康宣传</text>
      </view>
      <view class="detail-item">
        <text class="label">审核状态</text>
        <text class="value">已通过</text>
      </view>
      <view class="detail-item">
        <text class="label">审核积分</text>
        <text class="value">5 分</text>
      </view>
    </view>
  </view>
</template>

<script setup>
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
</style>
