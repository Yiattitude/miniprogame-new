<template>
  <view class="page">
    <view class="section-title">志愿服务子模块</view>
    <u-cell-group>
      <u-cell
        v-for="item in modules"
        :key="item.id"
        :title="item.name"
        :label="item.desc"
        isLink
        @click="goDetail(item)"
      />
    </u-cell-group>
  </view>
</template>

<script setup>
import { volunteerModules } from '@/utils/scoreRules'

const modules = volunteerModules

const goDetail = (item) => {
  uni.navigateTo({
    url: `/pages/volunteer-service/volunteer-detail?moduleId=${item.id}`
  })
}
</script>

<style scoped>
</style>
