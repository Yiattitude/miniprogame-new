<template>
  <view class="page page-with-nav">
    <view class="section-title text-center">管理后台</view>
    <view class="summary-grid">
      <view class="summary-card volunteer">
        <text class="summary-label">待审志愿服务</text>
        <text class="summary-value">{{ summary.pendingVolunteerCount }}</text>
      </view>
      <view class="summary-card honor">
        <text class="summary-label">待审荣誉获奖</text>
        <text class="summary-value">{{ summary.pendingHonorCount }}</text>
      </view>
      <view class="summary-card approved">
        <text class="summary-label">已审核</text>
        <text class="summary-value">{{ summary.approvedCount }}</text>
      </view>
      <view class="summary-card rejected">
        <text class="summary-label">已驳回</text>
        <text class="summary-value">{{ summary.rejectedCount }}</text>
      </view>
    </view>

    <view class="card-list">
      <view class="card" @click="goTo('/pages/admin/import')">
        <text class="card-title">批量数据导入</text>
        <text class="card-desc">查看模板字段并模拟导入历史</text>
      </view>
      <view class="card" @click="goTo('/pages/admin/audit')">
        <text class="card-title">数据审核</text>
        <text class="card-desc">处理志愿与荣誉申报，支持批量操作</text>
      </view>
      <view class="card" @click="goTo('/pages/admin/export')">
        <text class="card-title">全量数据导出</text>
        <text class="card-desc">按条件筛选并预览导出结果</text>
      </view>
    </view>

    <view class="section-title">最近操作日志</view>
    <view class="log-list">
      <view v-for="item in logs" :key="item.id" class="log-card">
        <text class="log-content">{{ item.content }}</text>
        <text class="log-meta">{{ item.operator }} · {{ item.time }} · {{ item.ip }}</text>
      </view>
    </view>

    <GlobalBottomNav current="admin" :showBack="false" />
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { getAdminDashboardSummary, getOperationLogs } from '@/utils/mockData'

/** 管理后台首页，展示审核统计和最近操作日志。 */

const summary = ref({
  pendingVolunteerCount: 0,
  pendingHonorCount: 0,
  approvedCount: 0,
  rejectedCount: 0
})
const logs = ref([])

/** 跳转到具体管理功能页。 */
const goTo = (url) => {
  uni.navigateTo({ url })
}

/** 页面展示时刷新统计与日志，并同步 TabBar 选中状态。 */
onShow(() => {
  uni.hideTabBar()
  summary.value = getAdminDashboardSummary()
  logs.value = getOperationLogs().slice(0, 5)
})
</script>

<style scoped>
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 18px;
}

.text-center {
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card {
  border-radius: 16px;
  padding: 18px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.summary-card.volunteer {
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.summary-card.honor {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}

.summary-card.approved {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
}

.summary-card.rejected {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}

.summary-label {
  font-size: 14px;
  line-height: 1.6;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
}

.card-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.card {
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.card-desc {
  font-size: 15px;
  color: #334155;
  line-height: 1.7;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.log-card {
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #e2e8f0;
}

.log-content {
  font-size: 15px;
  color: #111827;
  line-height: 1.7;
}

.log-meta {
  font-size: 13px;
  color: #475569;
}
</style>
