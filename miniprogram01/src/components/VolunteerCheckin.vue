<template>
  <view class="page page-with-nav">
    <!-- 头部标题 -->
    <view class="page-header" v-if="!showCheckinForm">
      <text class="page-title">{{ moduleInfo?.name }}</text>
    </view>
    <view class="page-header" v-else>
      <text class="page-title">志愿服务打卡申报</text>
    </view>

    <!-- 积分说明及操作（详情页） -->
    <block v-if="!showCheckinForm">
      <view class="points-rule-card">
        <text class="card-title">积分说明</text>
        <view class="rule-list">
          <text class="rule-item" v-for="(item, index) in moduleInfo?.rules" :key="index">
            {{ index + 1 }}. {{ item }}
          </text>
          <text class="rule-item" v-if="moduleInfo">
            {{ (moduleInfo?.rules?.length || 0) + 1 }}. 每次参与获得积分 {{ moduleInfo?.min }}-{{ moduleInfo?.max }} 分。
          </text>
        </view>
      </view>

      <view class="action-buttons">
        <view class="btn-primary" @click="showCheckinForm = true">
          <text class="btn-text">我要打卡</text>
        </view>
        <view class="btn-outline" @click="goRecord">
          <text class="btn-text-outline">打卡记录</text>
        </view>
      </view>
    </block>

    <!-- 打卡表单 -->
    <view class="checkin-container" v-if="showCheckinForm">
      <view class="form-card">
        <!-- 活动时间 -->
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">活动时间</text>
          </view>
          <view class="form-input-wrapper" @click="showTimePicker = true">
            <input
              class="form-input custom-input"
              v-model="form.activityTime"
              placeholder="选择日期"
              placeholder-class="input-placeholder"
              disabled
            />
            <uni-icons type="calendar" size="20" color="#c1c1ff" class="calendar-icon"></uni-icons>
          </view>
        </view>

        <!-- 活动地点 -->
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">活动地点</text>
          </view>
          <input
            class="form-input"
            v-model="form.location"
            placeholder="请填写活动举办地点"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 活动名称 -->
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">活动名称</text>
          </view>
          <input
            class="form-input"
            v-model="form.title"
            placeholder="请填写活动全称"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 参与内容 -->
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">参与内容</text>
          </view>
          <textarea
            class="form-textarea"
            v-model="form.content"
            placeholder="请详细描述您参与的活动内容"
            placeholder-class="input-placeholder"
            :maxlength="500"
          />
        </view>

        <!-- 申报积分 -->
        <view class="form-item">
          <view class="form-label">
            <text class="required">*</text>
            <text class="label-text">申报积分</text>
          </view>
          <input
            class="form-input"
            v-model="form.points"
            type="number"
            placeholder="请填写对应规则的积分值"
            placeholder-class="input-placeholder"
          />
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
              <uni-icons type="camera-filled" size="32" color="#7B7898"></uni-icons>
              <text class="upload-text">点击上传照片 (最多9张)</text>
            </view>
          </view>
        </view>

      </view>
      
      <view class="form-actions">
        <view class="btn-primary" @click="handleSubmit">
          <text class="btn-text">提交申请</text>
        </view>
        <view class="btn-cancel" @click="showCheckinForm = false">
          <text class="btn-text-cancel">取消</text>
        </view>
      </view>
    </view>

    <u-datetime-picker
      :show="showTimePicker"
      mode="date"
      @confirm="onTimeConfirm"
      @cancel="showTimePicker = false"
    />

    <GlobalBottomNav current="index" v-if="!showCheckinForm" />
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import UploadImage from '@/components/UploadImage.vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import { useUserStore } from '@/store'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'
import { request } from '@/utils/request'
import { getVolunteerModule } from '@/utils/rules'
import { ensureComplianceReady, requestAuditSubscribeMessage } from '@/utils/auth'

/** 志愿服务申报表单组件，负责积分校验、内容校验和订阅引导。 */

const props = defineProps({
  moduleId: {
    type: String,
    default: ''
  }
})

const userStore = useUserStore()
const showTimePicker = ref(false)
const showCheckinForm = ref(false)
const moduleInfo = computed(() => getVolunteerModule(props.moduleId))

const form = reactive({
  activityTime: '',
  location: '',
  title: '',
  content: '',
  points: '',
  files: []
})

/** 格式化日期为 YYYY-MM-DD 格式。 */
const formatDate = (date) => {
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 格式化时间选择器结果，统一显示到输入框中（仅年月日）。 */
const formatDateTime = (value) => {
  const date = new Date(value)
  return formatDate(date)
}

/** 选择活动时间后，回填表单。 */
const onTimeConfirm = (value) => {
  const timeValue = value?.value || value
  form.activityTime = formatDateTime(timeValue)
  showTimePicker.value = false
}

/** 打开当前模块的打卡记录列表。 */
const goRecord = () => {
  uni.navigateTo({ url: `/pages/volunteer/record?moduleId=${props.moduleId}` })
}

/** 提交志愿服务申报，并引导用户订阅审核结果通知。 */
const handleSubmit = async () => {
  if (!ensureComplianceReady(userStore)) {
    return
  }

  if (
    !form.activityTime ||
    !form.location ||
    !form.title ||
    !form.content ||
    !form.points ||
    form.files.length === 0
  ) {
    showErrorToast('请完整填写所有必填项')
    return
  }

  const pointsNum = Number(form.points)
  if (!moduleInfo.value) {
    showErrorToast('模块信息异常')
    return
  }

  if (Number.isNaN(pointsNum) || pointsNum < moduleInfo.value.min || pointsNum > moduleInfo.value.max) {
    showErrorToast('请输入符合规则的积分')
    return
  }

  try {
    uni.showLoading({ title: '提交中', mask: true })
    unwrapApiData(
      await request({
        url: '/volunteer/submit',
        method: 'POST',
        data: {
        moduleId: props.moduleId,
        activityTime: form.activityTime,
        location: form.location.trim(),
        title: form.title.trim(),
        content: form.content.trim(),
        points: pointsNum,
        files: form.files.map((item) => item?.url || item?.fileID || '').filter(Boolean)
        }
      }),
      {}
    )
    uni.hideLoading()

    showSuccessToast('提交成功，已进入待审核流程')
    await requestAuditSubscribeMessage(userStore)
    showCheckinForm.value = false
    Object.assign(form, { activityTime: '', location: '', title: '', content: '', points: '', files: [] })
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

/* 积分说明卡片 */
.points-rule-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin: 0 16px 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #333333;
  display: block;
  margin-bottom: 16px;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  font-size: 16px;
  color: #3A4A64;
  line-height: 1.5;
}

/* 详情页操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  padding: 0 16px;
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

.btn-outline {
  flex: 1;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #0076FF;
  cursor: pointer;
}

.btn-text-outline {
  font-size: 17px;
  font-weight: bold;
  color: #0076FF;
}

/* 打卡表单区域 */
.checkin-container {
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

/* 输入框通用样式 */
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

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 16px;
  color: #333333;
  background: #ffffff;
  box-sizing: border-box;
  min-height: 120px;
}

.input-placeholder {
  color: #aaaaaa;
}

/* 时间选择框伪装 */
.form-input-wrapper {
  position: relative;
  width: 100%;
}

.custom-input {
  background: transparent;
  color: #333333;
  padding-right: 40px; /* 为图标留空间 */
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 上传材料专用样式 */
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

/* 覆盖 UploadImage 内部样式以适应整宽卡片 */
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
  pointer-events: none; /* 让点击穿透到上传组件 */
  background: #fdfdfd;
}

.upload-text {
  font-size: 15px;
  color: #7B7898;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-cancel {
  background: transparent;
  border-radius: 12px;
  padding: 14px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-text-cancel {
  font-size: 16px;
  color: #999999;
}
</style>


