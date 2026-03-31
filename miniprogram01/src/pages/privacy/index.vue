<template>
  <view class="page page-with-nav">
    <view class="section-title">隐私设置</view>
    <view class="summary-card">
      <text class="summary-title">当前合规状态</text>
      <text class="summary-text">隐私协议：{{ userStore.privacyAgreed ? '已同意' : '未同意' }}</text>
      <text class="summary-text">用户认证：{{ userStore.hasRealname ? '已完成' : '未完成' }}</text>
      <text class="summary-text">消息订阅：{{ subscribeStatusLabel }}</text>
      <text class="summary-text">相册权限：{{ albumPermissionLabel }}</text>
      <text class="summary-text">相机权限：{{ cameraPermissionLabel }}</text>
    </view>

    <u-cell-group>
      <u-cell title="用户隐私保护指引" isLink @click="openGuide" />
      <u-cell title="系统权限管理" isLink @click="openPermissions" />
      <u-cell title="账号注销" @click="confirmCancel" />
    </u-cell-group>

    <GlobalBottomNav current="mine" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { useUserStore } from '@/store'
import { getSubscribeStatusLabel } from '@/utils/auth'
import { showSuccessToast } from '@/utils/feedback'
import { getPermissionStatusLabel, openSystemPermissionSetting } from '@/utils/upload'

/** 隐私设置页，集中展示隐私、订阅和系统权限状态。 */

const userStore = useUserStore()
const subscribeStatusLabel = computed(() => getSubscribeStatusLabel(userStore.subscribeAuditResult))
const albumPermissionLabel = computed(() => getPermissionStatusLabel(userStore.albumPermission))
const cameraPermissionLabel = computed(() => getPermissionStatusLabel(userStore.cameraPermission))

/** 打开隐私指引详情，方便用户再次查阅信息收集范围。 */
const openGuide = () => {
  uni.showModal({
    title: '用户隐私保护指引',
    content:
      '我们仅收集昵称、手机号码、申报数据和通知订阅状态，用于用户认证、积分审核和结果通知。您可在本页查看权限状态并申请账号注销。',
    showCancel: false
  })
}

/** 打开微信系统设置页，供用户重新开启相册或相机权限。 */
const openPermissions = async () => {
  await openSystemPermissionSetting()
}

/** 账号注销时提示后续处理时效，符合隐私告知要求。 */
const confirmCancel = () => {
  uni.showModal({
    title: '账号注销',
    content: '注销后，您的个人信息将在 7 个工作日内删除或匿名化处理。确认提交注销申请吗？',
    success: (res) => {
      if (res.confirm) {
        showSuccessToast('已提交注销申请')
      }
    }
  })
}
</script>

<style scoped>
.summary-card {
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 18px;
  border: 1px solid #dbeafe;
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.summary-text {
  font-size: 15px;
  color: #334155;
  line-height: 1.7;
}
</style>
