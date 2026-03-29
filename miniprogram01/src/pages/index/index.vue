<template>
  <view class="page page-with-nav">
    <view class="header">
      <text class="app-title">银才荟</text>

       <view class="welcome-card">
      <view class="welcome-content">
        <text class="welcome-title">欢迎使用老同志正能量发挥积分管理平台</text>
      </view>
      
    </view>
      <view class="points-card">
        <text class="points-label">总积分</text>
        <text class="points-value">{{ totalPoints }}</text>
      </view>
    </view>

    <view class="entry-list">
      <view class="entry-card" @click="goVolunteer">
        <view class="entry-card__decoration entry-card__decoration--red"></view>
        <view class="entry-content">
          <view class="entry-icon">
            <uni-icons type="heart-filled" size="28" color="#ff4d4f"></uni-icons>
          </view>
          <view class="entry-info">
            <text class="entry-title">志愿服务</text>
            <text class="entry-desc">申报志愿活动，累计积分</text>
          </view>
        </view>
      </view>
      <view class="entry-card" @click="goHonor">
        <view class="entry-card__decoration entry-card__decoration--yellow"></view>
        <view class="entry-content">
          <view class="entry-icon">
            <uni-icons type="medal" size="28" color="#faad14"></uni-icons>
          </view>
          <view class="entry-info">
            <text class="entry-title">荣誉获奖</text>
            <text class="entry-desc">申报荣誉奖项，累计积分</text>
          </view>
        </view>
      </view>
    </view>
    <GlobalBottomNav current="index" :showBack="false" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { getOverallScoreSummary } from '@/utils/mockData'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'

/** 首页，展示总积分和两大业务入口。 */

const userStore = useUserStore()
const totalPoints = computed(() => userStore.totalPoints)

/** 标记是否已初始化积分数据，避免重复加载。 */
let initialized = false

/** 进入志愿服务模块。 */
const goVolunteer = () => {
  uni.navigateTo({ url: '/pages/volunteer/index' })
}

/** 进入荣誉获奖模块。 */
const goHonor = () => {
  uni.navigateTo({ url: '/pages/honor/index' })
}

/** 页面显示时同步演示积分，仅在首次加载时获取数据。 */
const syncPoints = () => {
  if (initialized) return
  const scoreSummary = getOverallScoreSummary()
  userStore.setPoints({
    volunteerPoints: scoreSummary.volunteerPoints,
    honorPoints: scoreSummary.honorPoints
  })
  initialized = true
}

onShow(() => {
  uni.hideTabBar()
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
  text-align: center;
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

.welcome-card {
  background: linear-gradient(135deg, #1677ff, #5b8cff);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 18px;
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.2);
}

.welcome-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.welcome-title {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.6;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.entry-card {
  border-radius: 16px;
  padding: 18px 18px 18px 24px;
  min-height: 112px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.entry-card:active {
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.06);
}

.entry-card__decoration {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  border-radius: 6px 0 0 6px;
}

.entry-card__decoration--red {
  background: linear-gradient(180deg, #ff4d4f, #ff7875);
}

.entry-card__decoration--yellow {
  background: linear-gradient(180deg, #faad14, #ffc53d);
}

.entry-content {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.entry-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
  flex-shrink: 0;
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.entry-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.entry-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.entry-card :deep(.u-button) {
  min-width: 132px;
}
</style>
