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
    <Chart />

    <view class="section-title">功能入口</view>
    <u-cell-group>
      <u-cell title="我的申请" isLink @click="goTo('/pages/application/index')" />
      <u-cell title="消息订阅" :label="subscribeStatusLabel" isLink @click="handleSubscribe" />
      <u-cell title="个人信息" @click="showProfile" />
      <u-cell title="隐私设置" isLink @click="goTo('/pages/privacy/index')" />
      <u-cell v-if="userStore.isAdmin" title="管理后台" isLink @click="goTo('/pages/admin/index')" />
      <u-cell title="退出登录" @click="logout" />
    </u-cell-group>
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

/** 页面显示时同步积分，并再次校验登录与认证信息。 */
onShow(() => {
  if (!ensureComplianceReady(userStore, { redirect: true, toast: false })) {
    return
  }

  const scoreSummary = getOverallScoreSummary()
  userStore.setPoints({
    volunteerPoints: scoreSummary.volunteerPoints,
    honorPoints: scoreSummary.honorPoints
  })
})
</script>

<style scoped>
.points-header {
  background: linear-gradient(135deg, #1677ff, #5b8cff);
  border-radius: 16px;
  padding: 22px 20px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.points-title {
  font-size: 17px;
}

.points-total {
  font-size: 36px;
  font-weight: 700;
}

.points-breakdown {
  display: flex;
  gap: 14px;
}

.points-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 14px;
  line-height: 1.6;
}

.value {
  font-size: 20px;
  font-weight: 700;
}

</style>
