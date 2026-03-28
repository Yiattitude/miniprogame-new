<template>
  <view class="page page-with-nav">
    <view class="section-title">荣誉获奖级别</view>
    <u-cell-group>
      <u-cell
        v-for="item in levels"
        :key="item.path"
        :title="item.name"
        :label="`积分：${item.points} 分`"
        isLink
        @click="goApply(item)"
      />
    </u-cell-group>

    <GlobalBottomNav current="index" />
  </view>
</template>

<script setup>
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'

const levels = [
  { name: '国家级荣誉', points: 20, path: '/pages/honor/national' },
  { name: '省部级荣誉', points: 16, path: '/pages/honor/provincial' },
  { name: '厅局级荣誉', points: 12, path: '/pages/honor/bureau' },
  { name: '厂处级荣誉', points: 10, path: '/pages/honor/factory' }
]

const goApply = (item) => {
  uni.navigateTo({ url: item.path })
}
</script>

<style scoped>
</style>
