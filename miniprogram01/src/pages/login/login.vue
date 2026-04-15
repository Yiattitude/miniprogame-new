<template>
  <view class="page page-with-nav login-page">
    <view class="title">登录与隐私授权</view>

    <view v-if="step === 'privacy'" class="card">
      <text class="paragraph">
        为保障您的权益，请您在使用本小程序前仔细阅读并同意《用户隐私保护指引》。
      </text>
      <text class="section">我们收集的信息</text>
      <text class="paragraph">姓名、手机号码、志愿服务与荣誉申报数据。</text>
      <text class="section">使用目的</text>
      <text class="paragraph">用于身份核验、积分审核与服务通知。</text>
      <text class="section">保存期限</text>
      <text class="paragraph">仅在实现服务目的所必需期限内保存。</text>
      <text class="section">您的权利</text>
      <text class="paragraph">您可以查询、更正、删除个人信息并申请账号注销。</text>

      <view class="action-group">
        <u-button type="primary" text="同意并继续" size="large" @click="handleAgree" />
        <u-button type="info" text="拒绝并退出" size="large" @click="handleReject" />
      </view>
    </view>

    <view v-else-if="step === 'realname'" class="card">
      <text class="section">用户信息填写</text>
      <text class="paragraph">为保障积分申报真实性，请完成用户认证信息填写。</text>
      <text class="helper-text">请填写常用昵称和邀请码，后续用于登录识别和审核通知。</text>
      <u-form :model="form" labelPosition="top">
        <u-form-item label="姓名" required>
          <u-input v-model="form.name" placeholder="请输入姓名" />
        </u-form-item>
        <u-form-item label="手机号码" required label-width="120px">
          <u-input v-model="form.phone" placeholder="请输入手机号码" />
        </u-form-item>
      </u-form>
      <view class="action-group">
        <u-button type="primary" text="提交用户信息" size="large" @click="handleSubmit" />
      </view>
    </view>

    <view v-else class="card">
      <text class="section">流程完成</text>
      <text class="paragraph">隐私协议与用户认证均已完成，正在进入首页。</text>
    </view>

    <GlobalBottomNav current="index" :show-back="false" />
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { login, submitRealname, fetchUserProfile } from '@/api/user'
import { useUserStore } from '@/store'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { wxLogin } from '@/utils/auth'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'
import { isPhoneValid } from '@/utils/rules'

const isAdminRole = (role) => role === 'admin' || role === 'super-admin'

/** 登录与合规入口页，统一处理隐私同意、微信登录和用户认证。 */

const userStore = useUserStore()
const step = ref('privacy')

const form = reactive({
  name: userStore.name || '',
  phone: userStore.phone || ''
})

/** 根据当前合规状态同步登录步骤，避免首屏反复切换节点。 */
const syncStep = () => {
  if (userStore.privacyAgreed && userStore.hasRealname) {
    step.value = 'done'
    return
  }
  step.value = userStore.privacyAgreed && (userStore.sessionCode || userStore.openid) ? 'realname' : 'privacy'
}

/** 同步后端返回的用户资料与积分信息。 */
const applyUserProfile = (profile = {}) => {
  const userInfo = profile.userInfo || {}
  const userName = userInfo.realName || userInfo.name || ''
  const userPhone = userInfo.phone || ''
  userStore.setUserInfo({
    name: userName,
    realName: userName,
    phone: userPhone,
    role: userInfo.role || '',
    submittedAt: new Date().toISOString()
  })
  userStore.setAdmin(isAdminRole(userInfo.role))
  if (profile.scoreSummary) {
    userStore.setPoints({
      volunteerPoints: Number(profile.scoreSummary.volunteerPoints || 0),
      honorPoints: Number(profile.scoreSummary.honorPoints || 0)
    })
  }
}

/** 拉取用户资料，补齐实名、角色与积分。 */
const refreshUserProfile = async () => {
  const profileData = unwrapApiData(await fetchUserProfile(), {})
  applyUserProfile(profileData)
  return profileData
}

/** 用户同意隐私后，再发起微信登录并进入用户认证步骤。 */
const handleAgree = async () => {
  userStore.setPrivacyAgreed(true)
  syncStep()
  uni.showLoading({ title: '登录中', mask: true })
  const wxLoginRes = await wxLogin()
  uni.hideLoading()

  if (!wxLoginRes?.code) {
    uni.showModal({
      title: '登录失败',
      content: '暂时无法获取微信登录凭证，请稍后重试。',
      showCancel: false
    })
    return
  }

  try {
    const loginData = unwrapApiData(await login({ code: wxLoginRes.code }), {})
    const now = new Date().toISOString()
    userStore.setLoginSession({
      sessionCode: wxLoginRes.code,
      openid: loginData.openid || '',
      token: loginData.token || '',
      loginAt: now
    })
    userStore.setAuthInfo({
      openid: loginData.openid || '',
      token: loginData.token || '',
      isAdmin: isAdminRole(loginData.userInfo?.role)
    })

    if (loginData.userInfo) {
      const userName = loginData.userInfo.realName || ''
      userStore.setUserInfo({
        name: userName,
        realName: userName,
        phone: loginData.userInfo.phone || '',
        role: loginData.userInfo.role || '',
        submittedAt: now
      })
    }

    if (loginData.needBinding) {
      syncStep()
      return
    }

    await refreshUserProfile()
    syncStep()
    uni.reLaunch({ url: '/pages/index/index' })
  } catch (error) {
    showErrorToast(resolveApiErrorMessage(error, '登录失败，请稍后重试'))
  }
}

/** 用户拒绝隐私协议时，直接退出小程序。 */
const handleReject = () => {
  uni.showModal({
    title: '提示',
    content: '您需要同意隐私指引才能使用本小程序。',
    confirmText: '退出',
    showCancel: false,
    success: () => {
      if (typeof uni.exitMiniProgram === 'function') {
        uni.exitMiniProgram()
      } else {
        uni.navigateBack()
      }
    }
  })
}

/** 校验用户信息并提交实名信息，完成后进入首页。 */
const handleSubmit = async () => {
  if (!form.name || !form.phone) {
    showErrorToast('请完整填写用户信息')
    return
  }
  if (!isPhoneValid(form.phone)) {
    showErrorToast('邀请码格式不正确')
    return
  }

  try {
    const bindData = unwrapApiData(
      await submitRealname({
        realName: form.name.trim(),
        phone: form.phone.trim(),
        openid: userStore.openid
      }),
      {}
    )

    userStore.setAuthInfo({
      openid: bindData.openid || userStore.openid,
      token: bindData.token || userStore.token,
      isAdmin: isAdminRole(bindData.userInfo?.role)
    })

    if (bindData.userInfo) {
      const userName = bindData.userInfo.realName || ''
      userStore.setUserInfo({
        name: userName,
        realName: userName,
        phone: bindData.userInfo.phone || '',
        role: bindData.userInfo.role || '',
        submittedAt: new Date().toISOString()
      })
    }

    await refreshUserProfile()
    syncStep()
    showSuccessToast('用户信息已提交')
    uni.reLaunch({ url: '/pages/index/index' })
  } catch (error) {
    showErrorToast(resolveApiErrorMessage(error, '提交失败，请稍后重试'))
  }
}

/** 登录页展示时，若已完成合规则直接回首页。 */
onShow(() => {
  syncStep()
  if (userStore.privacyAgreed && userStore.hasRealname) {
    uni.reLaunch({ url: '/pages/index/index' })
  }
})
</script>

<style scoped>
.login-page {
  gap: 20px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #e2e8f0;
}

.section {
  font-size: 20px;
  font-weight: 700;
  margin-top: 6px;
  color: #0f172a;
}

.helper-text {
  padding: 14px 16px;
  border-radius: 12px;
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #fdba74;
}

.action-group {
  margin-top: 16px;
}
</style>


