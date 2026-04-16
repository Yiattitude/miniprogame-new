<template>
  <u-modal :show="show" title="用户隐私保护指引" @confirm="handleConfirm" @cancel="handleCancel">
    <view class="privacy-modal-body">
      <text class="privacy-modal-helper">请阅读并同意《用户隐私保护指引》后继续使用本小程序。</text>
      <view class="privacy-modal-content">
        <slot>
          <text class="privacy-modal-text">请阅读并同意《用户隐私保护指引》后继续使用。</text>
        </slot>
      </view>
    </view>
  </u-modal>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

/** 确认隐私协议。 */
const handleConfirm = () => emit('confirm')

/** 取消当前隐私确认。 */
const handleCancel = () => emit('cancel')
</script>

<style scoped>
.privacy-modal-body {
  padding: 8px 0 2px;
}

.privacy-modal-helper {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.7;
  color: #5f7992;
}

.privacy-modal-content {
  padding: 12px 14px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #dbe7f2;
}

.privacy-modal-text {
  font-size: 14px;
  color: #35516f;
  line-height: 1.75;
}
</style>
