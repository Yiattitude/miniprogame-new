<template>
  <view class="page">
    <view class="section-title">荣誉申报</view>
    <u-form :model="form" labelPosition="top">
      <u-form-item label="荣誉获奖名称" required>
        <u-input v-model="form.title" placeholder="请输入荣誉名称" />
      </u-form-item>
      <u-form-item label="获取时间" required>
        <u-input
          v-model="form.time"
          placeholder="请选择获取时间"
          readonly
          @click="showTimePicker = true"
        />
      </u-form-item>
      <u-form-item label="授奖单位" required>
        <u-input v-model="form.organization" placeholder="请输入授奖单位" />
      </u-form-item>
      <u-form-item label="荣誉积分" required>
        <u-input v-model="form.points" disabled />
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
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { getHonorLevel } from '@/utils/scoreRules'

const showTimePicker = ref(false)
const form = reactive({
  title: '',
  time: '',
  organization: '',
  points: '',
  files: []
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
  form.time = formatDateTime(timeValue)
  showTimePicker.value = false
}

onLoad((query) => {
  const level = getHonorLevel(query?.level)
  form.points = level ? `${level.points}` : ''
})

const handleSubmit = () => {
  if (!form.title || !form.time || !form.organization || !form.points || form.files.length === 0) {
    uni.showToast({ title: '请完整填写所有必填项', icon: 'none' })
    return
  }
  uni.showModal({
    title: '提交成功',
    content: '已进入待审核流程，可在“我的申请”中查看状态。'
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
