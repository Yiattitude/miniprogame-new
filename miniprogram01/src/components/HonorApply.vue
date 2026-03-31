<template>
  <view class="page page-with-nav">
    <view class="page-header">
      <text class="page-title">{{ levelInfo?.name || '荣誉获奖' }}申报</text>
    </view>

    <view class="form-container">
      <view class="form-card">
        <!-- 荣誉获奖名称 -->
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">荣誉获奖名称</text>
          </view>
          <input
            class="form-input"
            v-model="form.title"
            placeholder="请填写荣誉称号全称"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 获取时间 -->
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">获取时间</text>
          </view>
          <view class="form-input-wrapper" @click="showTimePicker = true">
            <input
              class="form-input custom-input"
              v-model="form.time"
              placeholder="选择日期"
              placeholder-class="input-placeholder"
              disabled
            />
            <uni-icons type="calendar" size="20" color="#c1c1ff" class="calendar-icon"></uni-icons>
          </view>
        </view>

        <!-- 授奖单位 -->
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">授奖单位</text>
          </view>
          <input
            class="form-input"
            v-model="form.organization"
            placeholder="请填写颁发单位全称"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 荣誉积分 -->
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">荣誉积分</text>
          </view>
          <input
            class="form-input disabled-input"
            v-model="form.pointsDisplay"
            disabled
          />
          <text class="form-hint">固定积分，不可修改</text>
        </view>

        <!-- 上传佐证材料 -->
        <view class="form-item upload-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">上传佐证材料</text>
          </view>
          <view class="upload-wrapper">
            <UploadImage v-model="form.files" />
            <view class="upload-placeholder" v-if="!form.files || form.files.length === 0">
              <uni-icons type="wallet" size="32" color="#eab308"></uni-icons>
              <text class="upload-text">上传证书照片</text>
            </view>
          </view>
        </view>
      </view>

      <view class="action-group">
        <view class="btn-primary" @click="handleSubmit">
          <text class="btn-text">提交申报</text>
        </view>
      </view>
    </view>

    <u-datetime-picker
      :show="showTimePicker"
      mode="datetime"
      @confirm="onTimeConfirm"
      @cancel="showTimePicker = false"
    />

    <GlobalBottomNav current="index" />
  </view>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import UploadImage from '@/components/UploadImage.vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import { useUserStore } from '@/store'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'
import { request } from '@/utils/request'
import { getHonorLevel } from '@/utils/rules'
import { ensureComplianceReady, requestAuditSubscribeMessage } from '@/utils/auth'

/** 荣誉申报表单组件，负责自动填充分值、内容校验和订阅引导。 */

const props = defineProps({
  levelId: {
    type: String,
    default: ''
  }
})

const userStore = useUserStore()
const showTimePicker = ref(false)
const levelInfo = computed(() => getHonorLevel(props.levelId))

const form = reactive({
  title: '',
  time: '',
  organization: '',
  points: '',
  pointsDisplay: '',
  files: []
})

/** 荣誉级别变化时，自动同步固定积分。 */
watchEffect(() => {
  if (levelInfo.value) {
    form.points = `${levelInfo.value.points}`
    form.pointsDisplay = `${levelInfo.value.points} 分`
  }
})

/** 格式化日期为 YYYY-MM-DD 格式（UI图中只显示日期）。 */
const formatDate = (date) => {
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 格式化时间选择器结果。 */
const formatDateTime = (value) => {
  const date = new Date(value)
  return formatDate(date)
}

/** 选择获奖时间后，回填表单。 */
const onTimeConfirm = (value) => {
  const timeValue = value?.value || value
  form.time = formatDateTime(timeValue)
  showTimePicker.value = false
}

/** 提交荣誉申报，并引导用户订阅审核结果通知。 */
const handleSubmit = async () => {
  if (!ensureComplianceReady(userStore)) {
    return
  }

  if (!form.title || !form.time || !form.organization || !form.points || form.files.length === 0) {
    showErrorToast('请完整填写所有必填项')
    return
  }

  try {
    uni.showLoading({ title: '提交中', mask: true })
    unwrapApiData(
      await request({
        url: '/honor/submit',
        method: 'POST',
        data: {
        levelId: props.levelId,
        title: form.title.trim(),
        time: form.time,
        organization: form.organization.trim(),
        points: Number(form.points),
        // 仅提交云端 fileID，确保管理员审核时能查看到真实附件。
        files: form.files.map((item) => item?.fileID || '').filter(Boolean)
        }
      }),
      {}
    )
    uni.hideLoading()
    showSuccessToast('提交成功，已进入待审核流程')
    await requestAuditSubscribeMessage(userStore)
    uni.navigateBack()
  } catch (error) {
    uni.hideLoading()
    showErrorToast(resolveApiErrorMessage(error, '提交失败，请稍后重试'))
  }
}

/** 页面显示时再次校验登录与实名状态。 */
onShow(() => {
  ensureComplianceReady(userStore, { redirect: true, toast: false })
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

.form-container {
  padding: 0 16px 20px;
}

.form-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.required {
  color: #d81e06;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  padding-top: 4px;
}

.label-text {
  font-size: 17px;
  color: #333333;
  font-weight: 800;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 16px;
  color: #333333;
  background: #ffffff;
  box-sizing: border-box;
  height: 48px;
}

.form-input-wrapper {
  position: relative;
  width: 100%;
}

.custom-input {
  background: transparent;
  color: #333333;
  padding-right: 40px;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.disabled-input {
  background: #f4f4f5;
  color: #555555;
  border-color: #e4e4e7;
}

.form-hint {
  font-size: 15px;
  color: #a1a1aa;
}

.input-placeholder {
  color: #aaaaaa;
}

.upload-wrapper {
  position: relative;
  width: 100%;
  min-height: 120px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

::v-deep .upload-wrapper .u-upload {
  width: 100%;
  padding: 16px;
}

.upload-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
  background: #fdfdfd;
}

.upload-text {
  font-size: 15px;
  color: #7B7898;
}

.action-group {
  margin-top: 30px;
  display: flex;
}

.btn-primary {
  flex: 1;
  background: #0076FF;
  border-radius: 12px;
  padding: 14px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-text {
  font-size: 17px;
  font-weight: bold;
  color: #ffffff;
}
</style>


