<template>
  <view class="page">
    <view class="section-title">志愿服务打卡</view>
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
        <u-input
          v-model="form.points"
          type="number"
          placeholder="请输入申报积分"
        />
        <text class="hint">范围：{{ scoreRange }}</text>
      </u-form-item>
      <u-form-item label="上传佐证材料" required>
        <u-upload
          :fileList="form.files"
          :maxCount="9"
          :maxSize="10240"
          accept="image"
        />
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
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getVolunteerModule } from '@/utils/scoreRules'

const showTimePicker = ref(false)
const moduleId = ref('')
const moduleInfo = computed(() => getVolunteerModule(moduleId.value))

const form = reactive({
  activityTime: '',
  location: '',
  title: '',
  content: '',
  points: '',
  files: []
})

const scoreRange = computed(() => {
  if (!moduleInfo.value) return '--'
  return `${moduleInfo.value.min}-${moduleInfo.value.max} 分`
})

onLoad((query) => {
  moduleId.value = query?.moduleId || ''
})

const formatDateTime = (value) => {
  const date = new Date(value)
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

const onTimeConfirm = (value) => {
  const timeValue = value?.value || value
  form.activityTime = formatDateTime(timeValue)
  showTimePicker.value = false
}

const handleSubmit = () => {
  if (
    !form.activityTime ||
    !form.location ||
    !form.title ||
    !form.content ||
    !form.points ||
    form.files.length === 0
  ) {
    uni.showToast({ title: '请完整填写所有必填项', icon: 'none' })
    return
  }

  const pointsNum = Number(form.points)
  if (!moduleInfo.value) {
    uni.showToast({ title: '模块信息异常', icon: 'none' })
    return
  }

  if (Number.isNaN(pointsNum) || pointsNum < moduleInfo.value.min || pointsNum > moduleInfo.value.max) {
    uni.showToast({ title: '请输入符合规则的积分', icon: 'none' })
    return
  }

  uni.showModal({
    title: '提交成功',
    content: '已进入待审核流程，可在“打卡记录”中查看状态。'
  })
}
</script>

<style scoped>
.hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.action-group {
  margin-top: 24px;
}
</style>
