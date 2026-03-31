<template>
  <view class="page page-with-tabbar">


    <!-- 顶部总积分大卡片 -->
    <view class="points-container">
      <view class="points-card">
        <text class="points-title">总积分</text>
        <text class="points-total">{{ userStore.totalPoints }}</text>
        
        <view class="divider-horizontal"></view>
        
        <view class="points-breakdown">
          <view class="points-item">
            <text class="label">志愿服务</text>
            <text class="value">{{ userStore.volunteerPoints }}</text>
          </view>
          <view class="divider-vertical"></view>
          <view class="points-item">
            <text class="label">荣誉获奖</text>
            <text class="value">{{ userStore.honorPoints }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 年度积分趋势卡片 -->
    <view class="chart-container">
      <view class="white-card">
        <Chart :refresh-key="chartRefreshKey" :trend-data="trendData" />
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="list-container">
      <view class="module-list">
        <view class="module-card" @click="goTo('/pages/application/index')">
          <text class="module-title">我的申请</text>
          <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
        </view>
        <view class="module-card" @click="showProfile">
          <text class="module-title">个人信息</text>
          <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
        </view>
        <view class="module-card" @click="goTo('/pages/privacy/index')">
          <text class="module-title">隐私设置</text>
          <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
        </view>
        <view class="module-card" @click="logout">
          <text class="module-title">退出登录</text>
          <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
        </view>
      </view>
    </view>
  </view>
  <GlobalBottomNav current="mine" :showBack="false" />
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { fetchUserProfile } from '@/api/user'
import { useUserStore } from '@/store'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { ensureComplianceReady } from '@/utils/auth'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'
import { maskName, maskPhone } from '@/utils/rules'
import Chart from '@/components/Chart.vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'

/** 我的页面，展示积分、个人信息与订阅状态。 */

const userStore = useUserStore()
const chartRefreshKey = ref(0)
const trendData = ref([])

/** 跳转到指定功能页。 */
const goTo = (url) => {
  uni.navigateTo({ url })
}

/** 脱敏展示用户认证信息，避免在前端完整暴露敏感字段。 */
const showProfile = () => {
  const maskedName = maskName(userStore.name)
  const maskedPhone = maskPhone(userStore.phone)
  uni.showModal({
    title: '个人信息',
    content: `昵称：${maskedName || '未填写'}\n手机号码：${maskedPhone || '未填写'}`,
    showCancel: false
  })
}

/** 退出登录后清理会话并回到合规登录入口。 */
const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确认退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.reset()
        showSuccessToast('已退出')
        uni.reLaunch({ url: '/pages/login/login' })
      }
    }
  })
}

/** 页面展示时拉取真实用户资料并刷新积分。 */
const syncProfile = async () => {
  try {
    const profileData = unwrapApiData(await fetchUserProfile(), {})
    const userInfo = profileData.userInfo || {}
    userStore.setUserInfo({
      name: userInfo.realName || userInfo.name || '',
      realName: userInfo.realName || userInfo.name || '',
      phone: userInfo.phone || '',
      role: userInfo.role || '',
      submittedAt: new Date().toISOString()
    })
    userStore.setAdmin(userInfo.role === 'admin')
    if (profileData.scoreSummary) {
      const volunteerPoints = Number(profileData.scoreSummary.volunteerPoints || 0)
      const honorPoints = Number(profileData.scoreSummary.honorPoints || 0)
      const totalPoints = volunteerPoints + honorPoints
      userStore.setPoints({
        volunteerPoints,
        honorPoints
      })

      // 使用真实积分生成近 5 年趋势：当前年展示总积分，其余年份为 0（后续可扩展为逐年明细接口）。
      const currentYear = new Date().getFullYear()
      trendData.value = Array.from({ length: 5 }, (_, index) => {
        const year = currentYear - 4 + index
        return {
          label: `${year}年`,
          total: year === currentYear ? totalPoints : 0
        }
      })
    }
    chartRefreshKey.value += 1
  } catch (error) {
    showErrorToast(resolveApiErrorMessage(error, '个人信息加载失败，请稍后重试'))
  }
}

onShow(() => {
  uni.hideTabBar()
  if (!ensureComplianceReady(userStore, { redirect: true, toast: false })) {
    return
  }
  syncProfile()
})
</script>

<style scoped>
.page {
  background-color: #f5f6fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  padding: 30px 20px 20px;
  text-align: center;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #333333;
  letter-spacing: 1px;
}

.points-container {
  padding: 0 16px 20px;
}

.points-card {
  background: #2563eb; 
  border-radius: 16px;
  padding: 30px 24px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.points-title {
  font-size: 17px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.points-total {
  font-size: 64px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 30px;
}

.divider-horizontal {
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  margin-bottom: 24px;
}

.points-breakdown {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.points-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.divider-vertical {
  width: 1px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
}

.label {
  font-size: 15px;
  opacity: 0.9;
}

.value {
  font-size: 24px;
  font-weight: bold;
}

.chart-container, .list-container {
  padding: 0 16px 20px;
}

.white-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 20px;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
}

.module-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.module-title {
  font-size: 16px;
  color: #333333;
  font-weight: 500;
}

.page-with-tabbar {
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
}
</style>



