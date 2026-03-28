<template>
  <view class="chart">
    <view class="chart-head">
      <text class="chart-title">年度积分趋势</text>
      <text class="chart-subtitle">点击年份查看积分构成</text>
    </view>

    <view class="bars">
      <view
        v-for="item in trend"
        :key="item.year"
        class="bar-item"
        @click="activeYear = item.year"
      >
        <text class="bar-value">{{ item.total }}</text>
        <view class="bar-track">
          <view
            class="bar-fill"
            :class="{ active: activeYear === item.year }"
            :style="{ height: `${getBarHeight(item.total)}px` }"
          />
        </view>
        <text class="bar-year" :class="{ active: activeYear === item.year }">{{ item.year }}</text>
      </view>
    </view>

    <view class="detail-card">
      <text class="detail-title">{{ activeTrend.year }} 年积分构成</text>
      <view class="detail-grid">
        <view class="detail-item">
          <text class="detail-label">总积分</text>
          <text class="detail-value">{{ activeTrend.total }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">志愿服务</text>
          <text class="detail-value accent-red">{{ activeTrend.volunteer }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">荣誉获奖</text>
          <text class="detail-value accent-gold">{{ activeTrend.honor }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getAnnualScoreTrend } from '@/utils/mockData'

/** 年度积分柱状图组件，使用前端演示数据展示年度趋势。 */

const trend = getAnnualScoreTrend()
const maxScore = Math.max(...trend.map((item) => item.total), 1)
const activeYear = ref(trend[trend.length - 1]?.year || '')

/** 根据当前总分计算柱子高度，保证各年份比例展示。 */
const getBarHeight = (total) => Math.max((total / maxScore) * 150, total > 0 ? 24 : 8)

/** 当前选中的年份详情。 */
const activeTrend = computed(
  () => trend.find((item) => item.year === activeYear.value) || trend[trend.length - 1] || { year: '--', total: 0, volunteer: 0, honor: 0 }
)
</script>

<style scoped>
.chart {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  color: #1f2937;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.chart-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
}

.chart-subtitle {
  font-size: 13px;
  color: #64748b;
}

.bars {
  height: 210px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin-top: 18px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-value {
  font-size: 12px;
  color: #475569;
}

.bar-track {
  width: 100%;
  max-width: 36px;
  height: 150px;
  border-radius: 999px;
  background: linear-gradient(180deg, #eff6ff, #dbeafe);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, #94a3b8, #64748b);
  transition: all 0.2s ease;
}

.bar-fill.active {
  background: linear-gradient(180deg, #ef4444, #f59e0b);
}

.bar-year {
  font-size: 12px;
  color: #64748b;
}

.bar-year.active {
  color: #111827;
  font-weight: 600;
}

.detail-card {
  margin-top: 18px;
  border-radius: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #fff7ed, #fef3c7);
}

.detail-title {
  font-size: 15px;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.detail-item {
  background: rgba(255, 255, 255, 0.72);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: #64748b;
}

.detail-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.accent-red {
  color: #dc2626;
}

.accent-gold {
  color: #b45309;
}
</style>
