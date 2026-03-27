<template>
  <view class="page">
    <view class="info-card">
      <text class="info-title">{{ moduleInfo?.name || '志愿服务' }}</text>
      <text class="info-desc">{{ moduleInfo?.desc || '请按积分规则申报' }}</text>
      <view class="rule-box">
        <text class="rule-label">积分说明</text>
        <text class="rule-text">每次 {{ moduleInfo?.min }} - {{ moduleInfo?.max }} 分</text>
      </view>
    </view>

    <view class="action-group">
      <u-button type="primary" text="打卡" size="large" @click="goCheckin" />
      <u-button type="info" text="打卡记录" size="large" @click="goRecords" />
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getVolunteerModule } from '@/utils/scoreRules'

const moduleId = ref('')
const moduleInfo = computed(() => getVolunteerModule(moduleId.value))

onLoad((query) => {
  moduleId.value = query?.moduleId || ''
})

const goCheckin = () => {
  uni.navigateTo({
    url: `/pages/volunteer-service/volunteer-checkin?moduleId=${moduleId.value}`
  })
}

const goRecords = () => {
  uni.navigateTo({
    url: `/pages/volunteer-service/volunteer-records?moduleId=${moduleId.value}`
  })
}
</script>

<style scoped>
.info-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-title {
  font-size: 18px;
  font-weight: 600;
}

.info-desc {
  font-size: 14px;
  color: #64748b;
}

.rule-box {
  background: #f0f5ff;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rule-label {
  font-size: 14px;
  color: #1677ff;
  font-weight: 600;
}

.rule-text {
  font-size: 16px;
  color: #1f2937;
}

.action-group {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
