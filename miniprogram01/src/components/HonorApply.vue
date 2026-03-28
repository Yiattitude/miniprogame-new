<template>
  <view class="page page-with-nav">
    <view class="info-card">
      <text class="info-title">{{ levelInfo?.name || '荣誉获奖' }}</text>
      <text class="info-desc">荣誉积分自动填充，提交后进入审核流程</text>
      <view class="rule-box">
        <text class="rule-label">荣誉积分</text>
        <text class="rule-text">{{ levelInfo?.points || '--' }} 分</text>
      </view>
    </view>

    <view class="section-title">荣誉申报</view>
    <text class="helper-text">荣誉积分会根据级别自动填充，您只需补充获奖信息和佐证材料。</text>
    <u-form :model="form" labelPosition="top">
      <u-form-item label="荣誉获奖名称" required>
        <u-input v-model="form.title" placeholder="请输入荣誉名称" />
      </u-form-item>
      <u-form-item label="获取时间" required>
        <u-input v-model="form.time" placeholder="请选择获取时间" readonly @click="showTimePicker = true" />
      </u-form-item>
      <u-form-item label="授奖单位" required>
        <u-input v-model="form.organization" placeholder="请输入授奖单位" />
      </u-form-item>
      <u-form-item label="荣誉积分" required>
        <u-input v-model="form.points" disabled />
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
import { computed, reactive, ref, watchEffect } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import UploadImage from '@/components/UploadImage.vue'
import { useUserStore } from '@/store'
import { showErrorToast } from '@/utils/feedback'
import { getHonorLevel } from '@/utils/rules'
import { checkContentSecurity } from '@/utils/upload'
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
  files: []
})

/** 荣誉级别变化时，自动同步固定积分。 */
watchEffect(() => {
  form.points = levelInfo.value ? `${levelInfo.value.points}` : ''
})

/** 格式化时间选择器结果，统一显示到输入框中。 */
const formatDateTime = (value) => {
  const date = new Date(value)
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
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

  const passed = await checkContentSecurity({
    text: {
      title: form.title,
      time: form.time,
      organization: form.organization,
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
    content: '已进入待审核流程，可在“我的申请”中查看状态。',
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
  border: 1px solid #fde68a;
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
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.rule-box {
  background: #fffdf5;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #fde68a;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-label {
  font-size: 16px;
  color: #b45309;
  font-weight: 700;
}

.rule-text {
  font-size: 20px;
  color: #1f2937;
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
