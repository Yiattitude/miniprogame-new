<template>
  <view class="page page-with-nav page-shell page-shell--honor page-shell--form">
    <view class="page-hero page-hero--honor">
      <view class="hero-badge">
        <uni-icons type="medal" size="16" color="#ffffff" />
        <text>{{ levelInfo?.name || '荣誉获奖' }}申报</text>
      </view>
      <text class="hero-title">荣誉信息一次填写完成，系统自动带出固定积分</text>
      <text class="hero-subtitle"
        >请按真实获奖情况填写名称、时间和授奖单位，并上传佐证材料后提交。</text
      >
    </view>

    <view class="themed-form-card">
      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 荣誉获奖名称</text>
        <input
          v-model="form.title"
          class="native-input"
          placeholder="请填写荣誉称号全称"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 获取时间</text>
        <view class="picker-input-theme" @click="showTimePicker = true">
          <text>{{ form.time || '请选择日期' }}</text>
          <uni-icons type="calendar" size="18" color="#7f95a9" />
        </view>
      </view>

      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 授奖单位</text>
        <input
          v-model="form.organization"
          class="native-input"
          placeholder="请填写颁发单位全称"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 荣誉积分</text>
        <input v-model="form.pointsDisplay" class="native-input native-input--disabled" disabled />
        <text class="field-helper">当前荣誉级别对应固定积分，不可修改。</text>
      </view>

      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 上传佐证材料</text>
        <text class="field-helper">请上传证书、奖状或其他可佐证的图片材料。</text>
        <view class="upload-shell upload-shell--honor">
          <UploadImage v-model="form.files" />
          <view v-if="!form.files || form.files.length === 0" class="upload-placeholder">
            <uni-icons type="medal" size="30" color="#cc8a11" />
            <text class="upload-text">上传证书照片或证明材料</text>
          </view>
        </view>
      </view>

      <view class="action-group">
        <u-button type="primary" text="提交申报" size="large" @click="handleSubmit" />
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

/** 格式化日期为 YYYY-MM-DD 格式。 */
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
          files: form.files.map((item) => item?.url || item?.fileID || '').filter(Boolean)
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
.required {
  color: #c85b51;
}

.native-input {
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid #dbe7f2;
  background: #f9fbff;
  box-sizing: border-box;
  color: #12304e;
  font-size: 16px;
}

.native-input--disabled {
  color: #5f7992;
  background: #f3f7fb;
}

.input-placeholder {
  color: #8ba0b5;
}

.upload-shell {
  position: relative;
  min-height: 136px;
  border-radius: 20px;
  border: 2px dashed #c6d7e8;
  background: linear-gradient(180deg, #f8fbff 0%, #fff8ee 100%);
  overflow: hidden;
}

.upload-shell--honor {
  background: linear-gradient(180deg, #f8fbff 0%, #fff7ea 100%);
}

.upload-placeholder {
  position: absolute;
  inset: 0;
  z-index: -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  pointer-events: none;
}

.upload-text {
  font-size: 15px;
  color: #35516f;
}

.action-group {
  display: flex;
}
</style>
