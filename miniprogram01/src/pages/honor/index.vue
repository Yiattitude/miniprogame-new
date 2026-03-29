<template>
  <view class="page page-with-nav">
    <!-- 头部标题 -->
    <view class="page-header">
      <text class="page-title">荣誉获奖申报</text>
    </view>

    <view class="level-list">
      <view class="level-card" v-for="item in levels" :key="item.path" @click="goApply(item)">
        <view class="level-main">
          <view class="level-header">
            <text class="level-title">{{ item.name }}</text>
            <text class="level-points">+{{ item.points }}分</text>
          </view>
          <text class="level-desc">{{ item.desc }}</text>
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
  { name: '国家级荣誉', desc: '获得国家级单位授予的各类荣誉称号', points: 20, path: '/pages/honor/national' },
  { name: '省部级荣誉', desc: '获得上海市、国网公司、全国电力行业等授予的各类荣誉称号', points: 15, path: '/pages/honor/provincial' },
  { name: '厅局级荣誉', desc: '获得分部、上海市经信委、退管会、区等单位授予的各类荣誉称号', points: 10, path: '/pages/honor/bureau' },
  { name: '厂处级荣誉', desc: '获得街道党工委、街道办事处等授予的各类荣誉称号', points: 5, path: '/pages/honor/factory' }
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
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.level-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
}

.level-card:active {
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.06);
}

.level-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.level-title {
  font-size: 18px;
  color: #333333;
  font-weight: 700;
}

.level-points {
  font-size: 14px;
  color: #0076FF;
  font-weight: 600;
  background: linear-gradient(135deg, #e6f2ff, #f0f7ff);
  padding: 4px 10px;
  border-radius: 12px;
}

.level-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  display: block;
}
</style>
