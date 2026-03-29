<template>
  <view class="page page-with-nav">
    <!-- 头部标题 -->
    <view class="page-header">
      <text class="page-title">荣誉获奖申报</text>
    </view>

    <view class="level-list">
      <view class="level-card" v-for="item in levels" :key="item.path" @click="goApply(item)">
        <view class="level-content">
          <text class="level-title">{{ item.name }}</text>
          <text class="level-points">每项积 {{ item.points }} 分</text>
        </view>
        <uni-icons type="right" size="18" color="#c8c9cc"></uni-icons>
      </view>
    </view>

    <GlobalBottomNav current="index" />
  </view>
</template>

<script setup>
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

const levels = [
  { name: '国家级荣誉', points: 20, path: '/pages/honor/national' },
  { name: '省部级荣誉', points: 15, path: '/pages/honor/provincial' },
  { name: '厅局级荣誉', points: 10, path: '/pages/honor/bureau' },
  { name: '厂处级荣誉', points: 5, path: '/pages/honor/factory' }
]

const goApply = (item) => {
  uni.navigateTo({ url: item.path })
}
</script>

<style scoped>
.page {
  background-color: #f5f6fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  padding: 30px 20px 10px;
  text-align: center;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #333333;
  letter-spacing: 1px;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.level-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.level-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-title {
  font-size: 20px;
  color: #333333;
  font-weight: 800;
}

.level-points {
  font-size: 16px;
  color: #0076FF;
  font-weight: bold;
}
</style>
