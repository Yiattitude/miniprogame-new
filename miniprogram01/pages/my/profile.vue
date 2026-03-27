<template>
  <view class="page">
    <view class="section-title">个人信息</view>
    <view class="card">
      <view class="row">
        <text class="label">姓名</text>
        <text class="value">{{ userStore.name || '未填写' }}</text>
      </view>
      <view class="row">
        <text class="label">身份证号</text>
        <text class="value">{{ maskedId }}</text>
      </view>
      <text class="hint">修改个人信息需提交管理员审核</text>
    </view>

    <u-button type="primary" text="申请修改" size="large" @click="applyChange" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { maskIdCard } from '@/utils/mask'

const userStore = useUserStore()
const maskedId = computed(() => maskIdCard(userStore.idCard))

const applyChange = () => {
  uni.showToast({ title: '已提交修改申请', icon: 'none' })
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
  gap: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}

.label {
  color: #64748b;
}

.value {
  color: #1f2937;
}

.hint {
  font-size: 12px;
  color: #94a3b8;
}
</style>
