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

const props = defineProps({
  refreshKey: {
    type: Number,
    default: 0
  },
  trendData: {
    type: Array,
    default: () => []
  }
})

/** 图表数据优先使用父页面传入，缺省时展示近 5 年空数据。 */
const trend = computed(() => {
  if (Array.isArray(props.trendData) && props.trendData.length > 0) {
    return props.trendData.map((item) => ({
      label: item.label || '',
      total: Number(item.total || 0)
    }))
  }

  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, index) => ({
    label: `${currentYear - 4 + index}年`,
    total: 0
  }))
})

const maxScore = computed(() => Math.max(...trend.value.map((item) => Number(item.total || 0)), 1))

/** 将积分值按最大值换算为柱子高度百分比。 */
const getBarHeight = (total) => (total > 0 ? (Number(total) / maxScore.value) * 100 : 0)
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
