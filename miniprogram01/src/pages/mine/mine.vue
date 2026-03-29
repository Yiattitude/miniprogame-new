<template>
  <view class="page page-with-nav">


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
        <Chart />
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="list-container">
      <view class="white-card padding-0">
        <u-cell-group :border="false">
          <u-cell title="我的申请" isLink @click="goTo('/pages/application/index')" :border="true" />
          <u-cell title="消息订阅" :label="subscribeStatusLabel" isLink @click="handleSubscribe" :border="true" />
          <u-cell title="个人信息" @click="showProfile" :border="true" />
          <u-cell title="隐私设置" isLink @click="goTo('/pages/privacy/index')" :border="true" />
          <u-cell title="退出登录" @click="logout" :border="false" />
        </u-cell-group>
      </view>
    </view>

    <GlobalBottomNav current="mine" :showBack="false" />
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import { useUserStore } from '@/store'
import { ensureComplianceReady, getSubscribeStatusLabel, requestAuditSubscribeMessage } from '@/utils/auth'
import { showSuccessToast } from '@/utils/feedback'
import { getOverallScoreSummary } from '@/utils/mockData'
import { maskName, maskPhone } from '@/utils/rules'
import Chart from '@/components/Chart.vue'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'

/** 我的页面，展示积分、个人信息与订阅状态。 */

const userStore = useUserStore()
const subscribeStatusLabel = computed(() => getSubscribeStatusLabel(userStore.subscribeAuditResult))

/** 跳转到指定功能页。 */
const goTo = (url) => {
  uni.navigateTo({ url })
}

/** 用户手动再次申请审核通知订阅。 */
const handleSubscribe = async () => {
  await requestAuditSubscribeMessage(userStore)
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

/** 标记是否已初始化积分数据，避免重复加载。 */
let initialized = false

/** 页面显示时同步积分，仅在首次加载时获取数据。 */
onShow(() => {
  uni.hideTabBar()
  if (!ensureComplianceReady(userStore, { redirect: true, toast: false })) {
    return
  }

  if (initialized) return
  const scoreSummary = getOverallScoreSummary()
  userStore.setPoints({
    volunteerPoints: scoreSummary.volunteerPoints,
    honorPoints: scoreSummary.honorPoints
  })
  initialized = true
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

.padding-0 {
  padding: 8px 10px;
}

::v-deep .u-cell__title-text {
  font-size: 18px !important;
  font-weight: 800 !important;
  color: #333333 !important;
}

::v-deep .u-cell {
  padding: 16px 12px !important;
}
</style>
