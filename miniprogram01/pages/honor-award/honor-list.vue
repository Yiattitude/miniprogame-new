<template>
  <view class="page">
    <view class="section-title">荣誉获奖级别</view>
    <u-cell-group>
      <u-cell
        v-for="item in levels"
        :key="item.id"
        :title="item.name"
        :label="`积分：${item.points} 分`"
        isLink
        @click="goApply(item)"
      />
    </u-cell-group>
  </view>
</template>

<script setup>
import { honorLevels } from '@/utils/scoreRules'

const levels = honorLevels

const goApply = (item) => {
  uni.navigateTo({ url: `/pages/honor-award/honor-apply?level=${item.id}` })
}
</script>

<style scoped>
</style>
