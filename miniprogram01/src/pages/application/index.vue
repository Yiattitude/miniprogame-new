<template>
  <view class="page page-with-nav">
    <view class="summary-grid">
      <view class="summary-card pending">
        <text class="summary-label">待审核</text>
        <text class="summary-value">{{ stats.pending }}</text>
      </view>
      <view class="summary-card approved">
        <text class="summary-label">已通过</text>
        <text class="summary-value">{{ stats.approved }}</text>
      </view>
      <view class="summary-card rejected">
        <text class="summary-label">已驳回</text>
        <text class="summary-value">{{ stats.rejected }}</text>
      </view>
    </view>

    <u-tabs :list="tabs" :current="current" @change="onTabChange" />

    <view v-if="filtered.length > 0" class="record-list">
      <view v-for="item in filtered" :key="item.id" class="record-card" @click="showDetail(item)">
        <view class="record-head">
          <view class="record-title-group">
            <text class="record-title">{{ item.title }}</text>
            <text class="record-category">{{ item.categoryName }}</text>
          </view>
          <u-tag :text="item.statusText" size="mini" :type="item.tagType" />
        </view>
        <text class="record-desc">{{ item.recordDesc }}</text>
        <text class="record-time">提交时间：{{ item.submitTime }}</text>
      </view>
    </view>

    <view v-else class="empty-card">
      <text class="empty-text">当前状态下暂无申报记录</text>
    </view>

    <view v-if="selectedRecord" class="detail-mask" @click.self="closeDetail">
      <view class="detail-panel">
        <text class="detail-title">{{ selectedRecord.title }}</text>
        <view class="detail-grid">
          <view class="detail-row">
            <text class="detail-label">申报类型</text>
            <text class="detail-text">{{ selectedRecord.categoryName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">活动/获奖时间</text>
            <text class="detail-text">{{ selectedRecord.activityTime }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">申报积分</text>
            <text class="detail-text">{{ selectedRecord.claimedPoints }} 分</text>
          </view>
          <view class="detail-row" v-if="selectedRecord.status === 'approved'">
            <text class="detail-label">审核通过积分</text>
            <text class="detail-text">{{ selectedRecord.approvedPoints }} 分</text>
          </view>
          <view class="detail-row" v-if="selectedRecord.location">
            <text class="detail-label">活动地点</text>
            <text class="detail-text">{{ selectedRecord.location }}</text>
          </view>
          <view class="detail-row" v-if="selectedRecord.organization">
            <text class="detail-label">授奖单位</text>
            <text class="detail-text">{{ selectedRecord.organization }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">内容说明</text>
            <text class="detail-text">{{ selectedRecord.content }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">佐证材料</text>
            <text class="detail-text">{{ selectedRecord.evidenceFiles.join('、') }}</text>
          </view>
          <view class="detail-row" v-if="selectedRecord.rejectReason">
            <text class="detail-label">驳回原因</text>
            <text class="detail-text warning-text">{{ selectedRecord.rejectReason }}</text>
          </view>
        </view>

        <view class="detail-actions">
          <u-button
            v-if="selectedRecord.status === 'rejected'"
            type="primary"
            text="修改并重提"
            size="large"
            @click="resubmitSelected"
          />
          <u-button type="info" plain text="关闭" size="large" @click="closeDetail" />
        </view>
      </view>
    </view>

    <GlobalBottomNav current="mine" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { showSuccessToast } from '@/utils/feedback'
import {
  decorateApplication,
  getApplicationStats,
  getDemoApplications,
  resubmitDemoApplication
} from '@/utils/mockData'

/** 我的申请页面，展示待审核、已通过、已驳回记录，并支持驳回后重提。 */

const tabs = [
  { name: '待审核' },
  { name: '已通过' },
  { name: '已驳回' }
]

const current = ref(0)
const records = ref(getDemoApplications())
const selectedRecord = ref(null)
const stats = computed(() => getApplicationStats())

const filtered = computed(() => {
  const statusKey = ['pending', 'approved', 'rejected'][current.value]
  return records.value
    .filter((item) => item.status === statusKey)
    .map((item) => ({
      ...decorateApplication(item),
      recordDesc:
        item.type === 'volunteer'
          ? `志愿服务申报 ${item.claimedPoints} 分`
          : `荣誉获奖申报 ${item.claimedPoints} 分`
    }))
})

/** 切换顶部状态 Tab。 */
const onTabChange = (index) => {
  current.value = typeof index === 'number' ? index : index?.index || 0
}

/** 打开申报详情弹层。 */
const showDetail = (item) => {
  selectedRecord.value = item
}

/** 关闭申报详情弹层。 */
const closeDetail = () => {
  selectedRecord.value = null
}

/** 驳回记录本地重提，模拟前端闭环。 */
const resubmitSelected = () => {
  if (!selectedRecord.value) return
  records.value = resubmitDemoApplication(selectedRecord.value.id)
  closeDetail()
  current.value = 0
  showSuccessToast('已重新提交，等待审核')
}
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.summary-card {
  border-radius: 14px;
  padding: 14px 10px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.summary-card.pending {
  background: linear-gradient(135deg, #f59e0b, #f97316);
}

.summary-card.approved {
  background: linear-gradient(135deg, #10b981, #14b8a6);
}

.summary-card.rejected {
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.summary-label {
  font-size: 12px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
}

.record-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.record-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.record-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.record-category {
  font-size: 13px;
  color: #64748b;
}

.record-desc,
.record-time {
  font-size: 13px;
  color: #475569;
}

.empty-card {
  margin-top: 16px;
  background: #ffffff;
  border-radius: 14px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
}

.detail-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: flex-end;
  z-index: 30;
}

.detail-panel {
  width: 100%;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  overflow-y: auto;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.detail-grid {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 13px;
  color: #64748b;
}

.detail-text {
  font-size: 15px;
  color: #1f2937;
  line-height: 1.6;
}

.warning-text {
  color: #dc2626;
}

.detail-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
