<template>
  <view class="page page-with-nav">
    <view class="module-list">
      <view class="module-card" v-for="item in modules" :key="item.path" @click="goDetail(item)">
        <text class="module-title">{{ item.name }}</text>
        <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
      </view>
    </view>

    <GlobalBottomNav current="index" />
  </view>
</template>

<script setup>
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

const modules = [
  {
    name: '传承红色文化',
    path: '/pages/volunteer/redCulture'
  },
  {
    name: '参与基层治理',
    path: '/pages/volunteer/governance'
  },
  {
    name: '服务企业发展',
    path: '/pages/volunteer/enterprise'
  },
  {
    name: '实施以老助老',
    path: '/pages/volunteer/helpOld'
  },
  {
    name: '其他服务',
    path: '/pages/volunteer/other'
  }
]

const goDetail = (item) => {
  uni.navigateTo({ url: item.path })
}
</script>

<style scoped>
.module-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.module-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.module-title {
  font-size: 16px;
  color: #333333;
  font-weight: 500;
}
</style>
