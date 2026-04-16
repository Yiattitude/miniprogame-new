<template>
  <view class="page page-with-nav page-shell page-shell--volunteer page-shell--form">
    <view v-if="!showCheckinForm" class="page-hero">
      <view class="hero-badge">
        <uni-icons type="heart-filled" size="16" color="#ffffff" />
        <text>{{ moduleInfo?.name || '志愿服务' }}</text>
      </view>
      <text class="hero-title">按活动实际情况申报志愿服务积分</text>
      <text class="hero-subtitle">先查看积分说明，再根据页面提示填写活动信息并上传佐证材料。</text>
    </view>

    <view v-else class="page-hero">
      <view class="hero-badge">
        <uni-icons type="compose" size="16" color="#ffffff" />
        <text>志愿服务打卡申报</text>
      </view>
      <text class="hero-title">请完整填写活动信息</text>
      <text class="hero-subtitle"
        >所有带 * 项均为必填项，提交前系统会校验积分范围与材料完整性。</text
      >
    </view>

    <block v-if="!showCheckinForm">
      <view class="themed-card">
        <text class="card-kicker">积分说明</text>
        <text class="card-title-main">{{ moduleInfo?.name }}</text>
        <view class="rule-list">
          <text v-for="(item, index) in moduleInfo?.rules" :key="index" class="rule-item">
            {{ index + 1 }}. {{ item }}
          </text>
          <text v-if="moduleInfo" class="rule-item">
            {{ (moduleInfo?.rules?.length || 0) + 1 }}. 每次参与获得积分 {{ moduleInfo?.min }}-{{
              moduleInfo?.max
            }}
            分。
          </text>
        </view>
      </view>

      <view class="action-group">
        <u-button type="primary" text="我要打卡" size="large" @click="showCheckinForm = true" />
        <u-button type="info" plain text="打卡记录" size="large" @click="goRecord" />
      </view>
    </block>

    <view v-if="showCheckinForm" class="themed-form-card">
      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 活动时间</text>
        <view class="picker-input-theme" @click="showTimePicker = true">
          <text>{{ form.activityTime || '请选择日期' }}</text>
          <uni-icons type="calendar" size="18" color="#7f95a9" />
        </view>
      </view>

      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 活动地点</text>
        <input
          v-model="form.location"
          class="native-input"
          placeholder="请填写活动举办地点"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 活动名称</text>
        <input
          v-model="form.title"
          class="native-input"
          placeholder="请填写活动全称"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 参与内容</text>
        <textarea
          v-model="form.content"
          class="native-textarea"
          placeholder="请详细描述您参与的活动内容"
          placeholder-class="input-placeholder"
          :maxlength="500"
        />
      </view>

      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 申报积分</text>
        <text class="field-helper"
          >当前模块可申报 {{ moduleInfo?.min }}-{{ moduleInfo?.max }} 分。</text
        >
        <input
          v-model="form.points"
          class="native-input"
          type="number"
          :placeholder="`请输入${moduleInfo?.min}-${moduleInfo?.max}之间的积分`"
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="field-shell">
        <text class="field-label"><text class="required">*</text> 上传佐证材料</text>
        <text class="field-helper">支持上传图片或文件，最多 9 张，单张不超过 10M。</text>
        <view class="upload-shell">
          <UploadImage v-model="form.files" />
          <view v-if="!form.files || form.files.length === 0" class="upload-placeholder">
            <uni-icons type="image" size="30" color="#0f8e88" />
            <text class="upload-text">点击上传图片或文件</text>
          </view>
        </view>
      </view>

      <view class="action-group">
        <u-button type="primary" text="提交申请" size="large" @click="handleSubmit" />
        <u-button type="info" plain text="取消" size="large" @click="showCheckinForm = false" />
      </view>
    </view>

    <u-datetime-picker
      :show="showTimePicker"
      mode="date"
      @confirm="onTimeConfirm"
      @cancel="showTimePicker = false"
    />

    <GlobalBottomNav v-if="!showCheckinForm" current="index" />
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

/** 格式化时间选择器结果，统一显示到输入框中。 */
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

  if (
    Number.isNaN(pointsNum) ||
    pointsNum < moduleInfo.value.min ||
    pointsNum > moduleInfo.value.max
  ) {
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
    Object.assign(form, {
      activityTime: '',
      location: '',
      title: '',
      content: '',
      points: '',
      files: []
    })
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
.rule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}

.rule-item {
  font-size: 15px;
  line-height: 1.75;
  color: #35516f;
}

.required {
  color: #c85b51;
}

.native-input,
.native-textarea {
  width: 100%;
  border-radius: 16px;
  border: 1px solid #dbe7f2;
  background: #f9fbff;
  box-sizing: border-box;
  color: #12304e;
  font-size: 16px;
}

.native-input {
  min-height: 52px;
  padding: 0 16px;
}

.native-textarea {
  min-height: 132px;
  padding: 14px 16px;
}

.input-placeholder {
  color: #8ba0b5;
}

.upload-shell {
  position: relative;
  min-height: 136px;
  border-radius: 20px;
  border: 2px dashed #c6d7e8;
  background: linear-gradient(180deg, #f8fbff 0%, #eef9f7 100%);
  overflow: hidden;
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
  flex-direction: column;
  gap: 12px;
}
</style>
