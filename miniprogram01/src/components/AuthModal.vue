<template>
  <u-modal :show="show" title="用户认证" @confirm="handleConfirm" @cancel="handleCancel">
    <view class="modal-card-body">
      <text class="modal-helper">请填写真实姓名和手机号码，便于后续积分审核与结果通知。</text>
      <u-form :model="form" label-position="top">
        <view class="modal-field-shell">
          <text class="modal-field-label">姓名</text>
          <u-input v-model="form.name" placeholder="请输入姓名" />
        </view>
        <view class="modal-field-shell">
          <text class="modal-field-label">手机号码</text>
          <u-input v-model="form.phone" placeholder="请输入手机号码" />
        </view>
      </u-form>
    </view>
  </u-modal>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
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

/** 确认提交认证信息。 */
const handleConfirm = () => emit('confirm', { ...form })

/** 取消当前认证弹窗。 */
const handleCancel = () => emit('cancel')
</script>

<style scoped>
.modal-card-body {
  padding: 10px 0 2px;
}

.modal-helper {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #5f7992;
}

.modal-field-shell + .modal-field-shell {
  margin-top: 12px;
}

.modal-field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 800;
  color: #12304e;
}
</style>
