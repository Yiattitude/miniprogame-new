<template>
  <view class="chart-wrapper">
    <view class="chart-head">
      <text class="chart-title">年度积分趋势</text>
      <text class="chart-subtitle">按年度展示积分变化，便于查看积累情况</text>
    </view>

    <view v-if="hasData" class="chart-grid-lines">
      <view v-for="line in gridLines" :key="line" class="chart-grid-line"></view>
    </view>

    <view class="chart-container">
      <view class="chart-axes">
        <view class="bars-area">
          <view
            v-for="(item, index) in trend"
            :key="index"
            class="bar-item"
            :style="{ width: `${barWidth}px` }"
          >
            <text class="bar-value" :class="{ 'bar-value--muted': item.total === 0 }">
              {{ item.total }}
            </text>
            <view
              class="bar-fill"
              :class="{
                'bar-fill--active': index === activeIndex,
                'bar-fill--empty': item.total === 0
              }"
              :style="{ height: `${getBarHeight(item.total)}%` }"
            ></view>
          </view>
        </view>

        <view class="x-axis-labels">
          <view
            v-for="(item, index) in trend"
            :key="index"
            class="x-label-item"
            :style="{ width: `${barWidth}px` }"
          >
            <text class="x-label" :class="{ 'x-label--active': index === activeIndex }">{{
              item.label
            }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!hasData" class="chart-empty">
      <text class="chart-empty__title">暂未生成年度积分趋势</text>
      <text class="chart-empty__desc">当年积分产生后，这里会自动展示近年变化情况。</text>
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
  return Array.from({ length: 4 }, (_, index) => ({
    label: `${currentYear - 3 + index}年`,
    total: 0
  }))
})

const maxScore = computed(() => Math.max(...trend.value.map((item) => Number(item.total || 0)), 1))
const hasData = computed(() => trend.value.some((item) => Number(item.total || 0) > 0))
const activeIndex = computed(() => {
  const list = trend.value.map((item) => Number(item.total || 0))
  const max = Math.max(...list, 0)
  return list.findIndex((item) => item === max)
})
const gridLines = [1, 2, 3, 4]

/** 将积分值按最大值换算为柱子高度百分比。 */
const getBarHeight = (total) => {
  if (!hasData.value) return 38
  return total > 0 ? Math.max((Number(total) / maxScore.value) * 100, 18) : 10
}

/** 计算柱子宽度，确保柱子与标签对齐。 */
const barWidth = computed(() => {
  const chartWidth = 320 // 图表容器宽度
  const padding = 20 // 左右内边距
  const gap = 10 // 柱子间距
  const availableWidth = chartWidth - padding
  const itemCount = trend.value.length
  return Math.floor(availableWidth / itemCount - gap)
})
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.chart-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chart-title {
  font-size: 20px;
  font-weight: 800;
  color: #12304e;
}

.chart-subtitle {
  font-size: 14px;
  color: #5f7992;
  line-height: 1.7;
}

.chart-grid-lines {
  position: absolute;
  top: 74px;
  left: 14px;
  right: 10px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.chart-grid-line {
  border-top: 1px dashed rgba(131, 160, 191, 0.42);
}

.chart-container {
  width: 100%;
  height: 220px;
  display: flex;
  padding: 0 10px 6px;
}

.chart-axes {
  flex: 1;
  border-left: 1px solid rgba(198, 215, 232, 0.9);
  border-bottom: 1px solid rgba(198, 215, 232, 0.9);
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 36px;
}

.bars-area {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 14px;
}

.bar-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 8px;
}

.bar-fill {
  width: 100%;
  min-height: 10%;
  background: linear-gradient(180deg, #76b5ff 0%, #1d63d8 100%);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 10px 18px rgba(29, 99, 216, 0.18);
}

.bar-fill--active {
  background: linear-gradient(180deg, #f1c562 0%, #16a58f 100%);
  box-shadow: 0 12px 20px rgba(22, 165, 143, 0.2);
}

.bar-fill--empty {
  background: linear-gradient(180deg, #d8e6f7 0%, #bdd2eb 100%);
  box-shadow: none;
}

.bar-value {
  width: 100%;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #1d63d8;
}

.bar-value--muted {
  color: #7f95a9;
}

.x-axis-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: space-between;
  padding: 0 15px;
}

.x-label-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.x-label {
  text-align: center;
  font-size: 14px;
  color: #7f95a9;
  white-space: nowrap;
}

.x-label--active {
  color: #1648a5;
  font-weight: 700;
}

.chart-empty {
  padding: 14px 10px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chart-empty__title {
  font-size: 15px;
  font-weight: 700;
  color: #12304e;
}

.chart-empty__desc {
  font-size: 13px;
  line-height: 1.7;
  color: #5f7992;
}
</style>
