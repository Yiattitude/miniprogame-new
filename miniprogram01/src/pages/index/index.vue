<template>
  <view class="page">
    <view class="header">
      <text class="app-title">银才荟</text>
      <view class="points-card">
        <text class="points-label">总积分</text>
        <text class="points-value">{{ totalPoints }}</text>
      </view>
    </view>

    <view class="section-title">快捷入口</view>
    <view class="entry-list">
      <view class="entry-card" @click="goVolunteer">
        <view class="entry-info">
          <text class="entry-title">志愿服务</text>
          <text class="entry-desc">志愿打卡申报与记录</text>
        </view>
        <u-button type="primary" text="进入" size="large" />
      </view>
      <view class="entry-card" @click="goHonor">
        <view class="entry-info">
          <text class="entry-title">荣誉获奖</text>
          <text class="entry-desc">荣誉申报与积分登记</text>
        </view>
        <u-button type="primary" text="进入" size="large" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { getOverallScoreSummary } from '@/utils/mockData'

/** 首页，展示总积分和两大业务入口。 */

const userStore = useUserStore()
const totalPoints = computed(() => userStore.totalPoints)

/** 进入志愿服务模块。 */
const goVolunteer = () => {
  uni.navigateTo({ url: '/pages/volunteer/index' })
}

/** 进入荣誉获奖模块。 */
const goHonor = () => {
  uni.navigateTo({ url: '/pages/honor/index' })
}

/** 页面显示时同步演示积分。 */
const syncPoints = () => {
  const scoreSummary = getOverallScoreSummary()
  userStore.setPoints({
    volunteerPoints: scoreSummary.volunteerPoints,
    honorPoints: scoreSummary.honorPoints
  })
}

onShow(() => {
  syncPoints()
})
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 10px 4px 18px;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.points-card {
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e2e8f0;
}

.points-label {
  font-size: 17px;
  color: #334155;
}

.points-value {
  font-size: 32px;
  font-weight: 700;
  color: #2563eb;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.entry-card {
  border-radius: 16px;
  padding: 18px;
  min-height: 112px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid #e2e8f0;
}

.entry-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
}

.entry-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.entry-desc {
  font-size: 15px;
  color: #334155;
  line-height: 1.7;
}

.entry-card :deep(.u-button) {
  min-width: 132px;
}
</style>
