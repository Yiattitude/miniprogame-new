<template>
  <view class="page page-with-nav">
    <view class="section-title">志愿服务子模块</view>
    <u-cell-group>
      <u-cell
        v-for="item in modules"
        :key="item.path"
        :title="item.name"
        :label="item.desc"
        isLink
        @click="goDetail(item)"
      />
    </u-cell-group>

    <GlobalBottomNav current="index" />
  </view>
</template>

<script setup>
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'

const modules = [
  {
    name: '传承红色文化（关心下一代）',
    desc: '红色宣讲、青少年教育等',
    path: '/pages/volunteer/redCulture'
  },
  {
    name: '参与基层治理',
    desc: '政策宣传、矛盾调解等',
    path: '/pages/volunteer/governance'
  },
  {
    name: '服务企业发展',
    desc: '技术咨询、经验指导等',
    path: '/pages/volunteer/enterprise'
  },
  {
    name: '实施以老助老',
    desc: '帮扶困难老同志等',
    path: '/pages/volunteer/helpOld'
  },
  {
    name: '其他服务',
    desc: '未涵盖的社区服务',
    path: '/pages/volunteer/other'
  }
]

const goDetail = (item) => {
  uni.navigateTo({ url: item.path })
}
</script>

<style scoped>
</style>
