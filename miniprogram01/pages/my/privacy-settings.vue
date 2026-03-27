<template>
  <view class="page">
    <view class="section-title">隐私设置</view>
    <u-cell-group>
      <u-cell title="用户隐私保护指引" isLink @click="openGuide" />
      <u-cell title="系统权限管理" isLink @click="openPermissions" />
      <u-cell title="账号注销" isLink @click="goCancel" />
    </u-cell-group>
  </view>
</template>

<script setup>
const openGuide = () => {
  uni.showToast({ title: '打开隐私保护指引', icon: 'none' })
}

const openPermissions = () => {
  uni.showToast({ title: '打开系统权限管理', icon: 'none' })
}

const goCancel = () => {
  uni.navigateTo({ url: '/pages/my/account-cancel' })
}
</script>

<style scoped>
</style>
