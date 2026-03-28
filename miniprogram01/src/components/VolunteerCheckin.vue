<template>
  <view class="page page-with-nav">
    <view class="info-card">
      <text class="info-title">{{ moduleInfo?.name || '志愿服务' }}</text>
      <text class="info-desc">{{ moduleInfo?.desc || '请按积分规则申报' }}</text>
      <view class="rule-box">
        <text class="rule-label">积分说明</text>
        <text class="rule-text">每次 {{ moduleInfo?.min }} - {{ moduleInfo?.max }} 分</text>
      </view>
    </view>

    <view class="action-row">
      <u-button type="info" text="查看打卡记录" size="large" @click="goRecord" />
    </view>

    <view class="section-title">志愿服务打卡</view>
    <text class="helper-text">请逐项填写活动信息，提交前会按当前模块积分规则进行校验。</text>
    <u-form :model="form" labelPosition="top">
      <u-form-item label="活动时间" required>
        <u-input
          v-model="form.activityTime"
          placeholder="请选择活动时间"
          readonly
          @click="showTimePicker = true"
        />
      </u-form-item>
      <u-form-item label="活动地点" required>
        <u-input v-model="form.location" placeholder="请输入活动地点" />
      </u-form-item>
      <u-form-item label="活动名称" required>
        <u-input v-model="form.title" placeholder="请输入活动名称" />
      </u-form-item>
      <u-form-item label="参与内容" required>
        <u-textarea v-model="form.content" placeholder="请输入参与内容" />
      </u-form-item>
      <u-form-item label="申报积分" required>
        <u-input v-model="form.points" type="number" placeholder="请输入申报积分" />
        <text class="hint">范围：{{ scoreRange }}</text>
      </u-form-item>
      <u-form-item label="上传佐证材料" required>
        <UploadImage v-model="form.files" />
        <text class="hint">单张不超过 10MB，最多 9 张</text>
      </u-form-item>
    </u-form>

    <view class="action-group">
      <u-button type="primary" text="提交" size="large" @click="handleSubmit" />
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
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import UploadImage from '@/components/UploadImage.vue'
import { useUserStore } from '@/store'
import { showErrorToast } from '@/utils/feedback'
import { getVolunteerModule } from '@/utils/rules'
import { checkContentSecurity } from '@/utils/upload'
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
const moduleInfo = computed(() => getVolunteerModule(props.moduleId))

const form = reactive({
  activityTime: '',
  location: '',
  title: '',
  content: '',
  points: '',
  files: []
})

/** 计算当前模块允许的积分范围文案。 */
const scoreRange = computed(() => {
  if (!moduleInfo.value) return '--'
  return `${moduleInfo.value.min}-${moduleInfo.value.max} 分`
})

/** 格式化时间选择器结果，统一显示到输入框中。 */
const formatDateTime = (value) => {
  const date = new Date(value)
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
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

  const passed = await checkContentSecurity({
    text: {
      activityTime: form.activityTime,
      location: form.location,
      title: form.title,
      content: form.content,
      points: form.points
    },
    files: form.files
  })

  if (!passed) {
    uni.showModal({ title: '内容校验未通过', content: '请修改内容后重新提交。', showCancel: false })
    return
  }

  uni.showModal({
    title: '提交成功',
    content: '已进入待审核流程，可在“打卡记录”中查看状态。',
    showCancel: false,
    success: async () => {
      await requestAuditSubscribeMessage(userStore)
    }
  })
}

/** 页面显示时再次校验登录与实名状态。 */
onShow(() => {
  ensureComplianceReady(userStore, { redirect: true, toast: false })
})
</script>

<style scoped>
.info-card {
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #dbeafe;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.info-desc {
  font-size: 15px;
  color: #334155;
  line-height: 1.7;
}

.helper-text {
  padding: 14px 16px;
  border-radius: 12px;
  background: #eff6ff;
  color: #1e3a8a;
  border: 1px solid #bfdbfe;
}

.rule-box {
  background: #f8fbff;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #dbeafe;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-label {
  font-size: 16px;
  color: #1d4ed8;
  font-weight: 700;
}

.rule-text {
  font-size: 20px;
  color: #1f2937;
}

.action-row {
  margin-top: 10px;
}

.hint {
  margin-top: 8px;
  display: block;
  font-size: 15px;
  color: #334155;
}

.action-group {
  margin-top: 20px;
}
</style>
