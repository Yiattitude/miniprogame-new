<template>
  <view class="chart-wrapper">
    <text class="chart-title">年度积分趋势</text>
    
    <view class="chart-container">
      <view class="chart-axes">
        <view class="bars-area">
          <view
            v-for="(item, index) in trend"
            :key="index"
            class="bar-item"
          >
            <view class="bar-fill" :style="{ height: `${getBarHeight(item.total)}%` }"></view>
          </view>
        </view>
        
        <view class="x-axis-labels">
          <text v-for="(item, index) in trend" :key="index" class="x-label">{{ item.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getAnnualScoreTrend } from '@/utils/mockData'

const rawTrend = getAnnualScoreTrend()

// 将后端的原始年份数字包装为带单位的形式，方便x轴标签阅读
const trend = rawTrend.map(item => ({
  label: item.year + '年',
  total: item.total
}))

const maxScore = Math.max(...trend.map(i => i.total), 1)

const getBarHeight = (total) => {
  return total > 0 ? (total / maxScore) * 100 : 0
}
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-title {
  font-size: 20px;
  font-weight: 800;
  color: #333333;
}

.chart-container {
  width: 100%;
  height: 200px;
  display: flex;
  padding-right: 10px; /* 右侧留一点白 */
}

.chart-axes {
  flex: 1;
  border-left: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 30px;
}

.bars-area {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 10px;
}

.bar-item {
  width: 36px;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar-fill {
  width: 100%;
  background-color: #3b82f6; 
}

.x-axis-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
}

.x-label {
  width: 36px;
  text-align: center;
  font-size: 14px;
  color: #9ca3af;
}
</style>
