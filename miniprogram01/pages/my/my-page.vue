<template>
  <view class="page">
    <view class="points-header">
      <text class="points-title">总积分</text>
      <text class="points-total">{{ userStore.totalPoints }}</text>
      <view class="points-breakdown">
        <view class="points-item">
          <text class="label">志愿服务积分</text>
          <text class="value">{{ userStore.volunteerPoints }}</text>
        </view>
        <view class="points-item">
          <text class="label">荣誉获奖积分</text>
          <text class="value">{{ userStore.honorPoints }}</text>
        </view>
      </view>
    </view>

    <view class="section-title">年度积分趋势</view>
    <view class="chart-placeholder">图表组件待接入</view>

    <view class="section-title">功能入口</view>
    <u-cell-group>
      <u-cell title="我的申请" isLink @click="goTo('/pages/my/my-applications')" />
      <u-cell title="消息订阅" isLink @click="goTo('/pages/my/message-subscribe')" />
      <u-cell title="个人信息" isLink @click="goTo('/pages/my/profile')" />
      <u-cell title="隐私设置" isLink @click="goTo('/pages/my/privacy-settings')" />
      <u-cell title="退出登录" @click="logout" />
    </u-cell-group>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { setTabBarIndex } from '@/utils/tabbar'

const userStore = useUserStore()

const goTo = (url) => {
  uni.navigateTo({ url })
}

const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确认退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.reset()
        uni.showToast({ title: '已退出', icon: 'none' })
      }
    }
  })
}

onShow(() => {
  setTabBarIndex(1)
})
</script>

<style scoped>
.points-header {
  background: linear-gradient(135deg, #1677ff, #5b8cff);
  border-radius: 16px;
  padding: 20px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.points-title {
  font-size: 16px;
}

.points-total {
  font-size: 32px;
  font-weight: 700;
}

.points-breakdown {
  display: flex;
  gap: 16px;
}

.points-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
}

.value {
  font-size: 18px;
  font-weight: 600;
}

.chart-placeholder {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: #94a3b8;
}
</style>
