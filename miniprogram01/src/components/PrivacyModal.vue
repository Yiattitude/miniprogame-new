<template>
  <u-modal :show="show" title="用户隐私保护指引" @confirm="handleConfirm" @cancel="handleCancel">
    <view class="content">
      <slot>
        <text>请阅读并同意《用户隐私保护指引》后继续使用。</text>
      </slot>
    </view>
  </u-modal>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const handleConfirm = () => emit('confirm')
const handleCancel = () => emit('cancel')
</script>

<style scoped>
.content {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}
</style>
