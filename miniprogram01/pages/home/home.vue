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
import { useUserStore } from '@/stores/user'
import { setTabBarIndex } from '@/utils/tabbar'

const userStore = useUserStore()
const totalPoints = computed(() => userStore.totalPoints)

const goVolunteer = () => {
  uni.navigateTo({ url: '/pages/volunteer-service/volunteer-list' })
}

const goHonor = () => {
  uni.navigateTo({ url: '/pages/honor-award/honor-list' })
}

onShow(() => {
  setTabBarIndex(0)
})
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 4px 16px;
}

.app-title {
  font-size: 22px;
  font-weight: 700;
}

.points-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.points-label {
  font-size: 16px;
  color: #64748b;
}

.points-value {
  font-size: 28px;
  font-weight: 700;
  color: #1677ff;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.entry-title {
  font-size: 18px;
  font-weight: 600;
}

.entry-desc {
  font-size: 14px;
  color: #64748b;
}
</style>
