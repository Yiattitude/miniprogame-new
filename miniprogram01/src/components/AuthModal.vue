<template>
  <u-modal :show="show" title="用户认证" @confirm="handleConfirm" @cancel="handleCancel">
    <view class="content">
      <u-form :model="form" labelPosition="top">
        <u-form-item label="姓名" required>
          <u-input v-model="form.name" placeholder="请输入姓名" />
        </u-form-item>
        <u-form-item label="手机号码" required>
          <u-input v-model="form.phone" placeholder="请输入手机号码" />
        </u-form-item>
      </u-form>
    </view>
  </u-modal>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const form = reactive({
  name: '',
  phone: ''
})

const handleConfirm = () => emit('confirm', { ...form })
const handleCancel = () => emit('cancel')
</script>

<style scoped>
.content {
  padding: 8px 0;
}
</style>
