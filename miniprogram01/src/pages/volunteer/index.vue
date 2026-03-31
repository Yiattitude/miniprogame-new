<template>
  <view class="page page-with-nav">
    <view class="module-list">
      <view class="module-card" v-for="item in modules" :key="item.path" @click="goDetail(item)">
        <view class="module-content">
          <text class="module-title">{{ item.name }}</text>
          <text class="module-desc">{{ item.description }}</text>
        </view>
        <uni-icons type="right" size="20" color="#ffffff"></uni-icons>
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
    description: '红色主题宣讲、青少年教育等',
    path: '/pages/volunteer/redCulture'
  },
  {
    name: '参与基层治理',
    description: '政策宣传、矛盾调解、治安巡逻等',
    path: '/pages/volunteer/governance'
  },
  {
    name: '服务企业发展',
    description: '技术咨询、经验指导等',
    path: '/pages/volunteer/enterprise'
  },
  {
    name: '实施以老助老',
    description: '帮扶困难老同志等',
    path: '/pages/volunteer/helpOld'
  },
  {
    name: '其他服务',
    description: '未涵盖的社区服务',
    path: '/pages/volunteer/other'
  }
]

const goDetail = (item) => {
  uni.navigateTo({ url: item.path })
}
</script>

<style scoped>
.page {
  background-color: #F8F9FA;
  min-height: 100vh;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.module-card {
  background: linear-gradient(145deg, #4B8BF5, #1D4ED8);
  border-radius: 16px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 
    0 8px 20px rgba(37, 99, 235, 0.35),
    0 4px 8px rgba(37, 99, 235, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

.module-card:active {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 
    0 12px 28px rgba(37, 99, 235, 0.45),
    0 6px 12px rgba(37, 99, 235, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.module-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.module-title {
  font-size: 18px;
  color: #ffffff;
  font-weight: 700;
}

.module-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  display: block;
  line-height: 1.4;
}
</style>
