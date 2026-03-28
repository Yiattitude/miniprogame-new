<template>
  <view class="page page-with-nav">
    <u-tabs :list="tabs" :current="current" @change="onTabChange" />

    <view class="toolbar-card">
      <text class="toolbar-text">当前列表 {{ filtered.length }} 条</text>
      <text class="toolbar-text" v-if="isPendingTab">已选 {{ selectedIds.length }} 条</text>
    </view>

    <view v-if="isPendingTab" class="batch-actions">
      <u-button type="info" plain :text="selectAllText" @click="toggleSelectAll" />
      <u-button
        type="primary"
        text="批量通过"
        :disabled="selectedIds.length === 0"
        @click="approveSelected"
      />
      <u-button
        type="error"
        text="批量驳回"
        :disabled="selectedIds.length === 0"
        @click="rejectSelected"
      />
    </view>

    <view v-if="filtered.length > 0" class="audit-list">
      <view v-for="item in filtered" :key="item.id" class="audit-card">
        <view class="audit-main" @click="openDetail(item)">
          <view class="audit-head">
            <view class="audit-title-group">
              <text class="audit-title">{{ item.title }}</text>
              <text class="audit-meta">{{ item.applicantName }} · {{ item.categoryName }}</text>
            </view>
            <u-tag :text="item.statusText" size="mini" :type="item.tagType" />
          </view>
          <text class="audit-desc">{{ item.desc }}</text>
        </view>

        <view v-if="isPendingTab" class="audit-actions">
          <u-button
            type="info"
            plain
            :text="selectedIds.includes(item.id) ? '取消勾选' : '勾选'"
            @click="toggleSelect(item.id)"
          />
          <u-button type="primary" plain text="审核" @click="openDetail(item)" />
        </view>
      </view>
    </view>

    <view v-else class="empty-card">
      <text class="empty-text">当前筛选下暂无审核数据</text>
    </view>

    <view v-if="detailRecord" class="detail-mask" @click.self="closeDetail">
      <view class="detail-panel">
        <text class="detail-title">{{ detailRecord.title }}</text>
        <view class="detail-grid">
          <view class="detail-row">
            <text class="detail-label">申报人</text>
            <text class="detail-text">{{ detailRecord.applicantName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">申报时间</text>
            <text class="detail-text">{{ detailRecord.submitTime }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">申报类型</text>
            <text class="detail-text">{{ detailRecord.categoryName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">申报内容</text>
            <text class="detail-text">{{ detailRecord.content }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">申报积分</text>
            <text class="detail-text">{{ detailRecord.claimedPoints }} 分</text>
          </view>
          <view class="detail-row" v-if="detailRecord.location">
            <text class="detail-label">活动地点</text>
            <text class="detail-text">{{ detailRecord.location }}</text>
          </view>
          <view class="detail-row" v-if="detailRecord.organization">
            <text class="detail-label">授奖单位</text>
            <text class="detail-text">{{ detailRecord.organization }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">佐证材料</text>
            <text class="detail-text">{{ detailRecord.evidenceFiles.join('、') }}</text>
          </view>
        </view>

        <view v-if="detailRecord.status === 'pending'" class="form-card">
          <view v-if="detailRecord.type === 'volunteer'" class="form-group">
            <text class="form-label">调整积分</text>
            <u-input v-model="reviewForm.approvedPoints" type="number" placeholder="请输入审核积分" />
          </view>

          <view v-if="detailRecord.type === 'honor'" class="form-group">
            <text class="form-label">调整荣誉级别</text>
            <view class="level-row">
              <view
                v-for="item in honorLevelOptions"
                :key="item.id"
                class="level-chip"
                :class="{ active: reviewForm.levelId === item.id }"
                @click="reviewForm.levelId = item.id"
              >
                <text class="level-chip-text">{{ item.name }}</text>
              </view>
            </view>
          </view>

          <view class="form-group">
            <text class="form-label">驳回原因</text>
            <u-textarea v-model="reviewForm.rejectReason" placeholder="请输入驳回原因" />
          </view>
        </view>

        <view class="detail-actions">
          <u-button
            v-if="detailRecord.status === 'pending'"
            type="primary"
            text="通过"
            size="large"
            @click="approveRecord(detailRecord)"
          />
          <u-button
            v-if="detailRecord.status === 'pending'"
            type="error"
            text="驳回"
            size="large"
            @click="rejectRecord(detailRecord)"
          />
          <u-button type="info" plain text="关闭" size="large" @click="closeDetail" />
        </view>
      </view>
    </view>

    <GlobalBottomNav current="mine" />
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { showSuccessToast } from '@/utils/feedback'
import {
  getAdminAuditRecords,
  updateDemoAuditRecord,
  updateDemoAuditRecordsBatch
} from '@/utils/mockData'
import { honorLevels } from '@/utils/rules'

/** 管理员审核页，支持单条审核、批量通过和批量驳回。 */

const tabs = [
  { name: '待审核志愿服务' },
  { name: '待审核荣誉获奖' },
  { name: '已审核' },
  { name: '已驳回' }
]

const current = ref(0)
const records = ref(getAdminAuditRecords())
const selectedIds = ref([])
const detailRecord = ref(null)
const honorLevelOptions = honorLevels
const reviewForm = reactive({
  approvedPoints: '',
  levelId: '',
  rejectReason: ''
})

/** 根据当前页签筛选审核记录。 */
const filtered = computed(() => {
  if (current.value === 0) {
    return records.value.filter((item) => item.type === 'volunteer' && item.status === 'pending')
  }
  if (current.value === 1) {
    return records.value.filter((item) => item.type === 'honor' && item.status === 'pending')
  }
  if (current.value === 2) {
    return records.value.filter((item) => item.status === 'approved')
  }
  return records.value.filter((item) => item.status === 'rejected')
})

const isPendingTab = computed(() => current.value === 0 || current.value === 1)
const selectAllText = computed(() =>
  filtered.value.length > 0 && selectedIds.value.length === filtered.value.length ? '取消全选' : '全选'
)

/** 重新加载本地演示审核数据。 */
const refreshRecords = () => {
  records.value = getAdminAuditRecords()
}

/** 重置审核表单，避免上一次输入残留。 */
const resetReviewForm = (record) => {
  reviewForm.approvedPoints = `${record?.claimedPoints || ''}`
  reviewForm.levelId = record?.levelId || honorLevelOptions[0]?.id || ''
  reviewForm.rejectReason = record?.rejectReason || ''
}

/** 切换审核页签时清空已勾选项。 */
const onTabChange = (index) => {
  current.value = typeof index === 'number' ? index : index?.index || 0
  selectedIds.value = []
}

/** 打开单条记录详情，并带出可调整字段。 */
const openDetail = (record) => {
  detailRecord.value = record
  resetReviewForm(record)
}

/** 关闭详情弹层。 */
const closeDetail = () => {
  detailRecord.value = null
}

/** 勾选或取消勾选单条待审核记录。 */
const toggleSelect = (recordId) => {
  selectedIds.value = selectedIds.value.includes(recordId)
    ? selectedIds.value.filter((item) => item !== recordId)
    : [...selectedIds.value, recordId]
}

/** 全选或取消全选当前页签下的待审核记录。 */
const toggleSelectAll = () => {
  if (selectedIds.value.length === filtered.value.length) {
    selectedIds.value = []
    return
  }
  selectedIds.value = filtered.value.map((item) => item.id)
}

/** 通过单条记录，并支持调整积分或荣誉级别。 */
const approveRecord = (record) => {
  const payload =
    record.type === 'volunteer'
      ? {
          status: 'approved',
          approvedPoints: Number(reviewForm.approvedPoints || record.claimedPoints),
          rejectReason: ''
        }
      : {
          status: 'approved',
          levelId: reviewForm.levelId || record.levelId,
          approvedPoints:
            honorLevelOptions.find((item) => item.id === (reviewForm.levelId || record.levelId))?.points ||
            record.claimedPoints,
          claimedPoints:
            honorLevelOptions.find((item) => item.id === (reviewForm.levelId || record.levelId))?.points ||
            record.claimedPoints,
          rejectReason: ''
        }

  updateDemoAuditRecord(record.id, payload)
  refreshRecords()
  closeDetail()
  selectedIds.value = selectedIds.value.filter((item) => item !== record.id)
  showSuccessToast('审核已通过')
}

/** 驳回单条记录，并记录驳回原因。 */
const rejectRecord = (record) => {
  updateDemoAuditRecord(record.id, {
    status: 'rejected',
    rejectReason: reviewForm.rejectReason || '请补充材料后重新提交。'
  })
  refreshRecords()
  closeDetail()
  selectedIds.value = selectedIds.value.filter((item) => item !== record.id)
  showSuccessToast('已驳回该申报')
}

/** 批量通过当前勾选的待审核记录。 */
const approveSelected = () => {
  if (selectedIds.value.length === 0) return
  updateDemoAuditRecordsBatch(selectedIds.value, { status: 'approved' })
  refreshRecords()
  selectedIds.value = []
  showSuccessToast('批量通过完成')
}

/** 批量驳回当前勾选的待审核记录。 */
const rejectSelected = () => {
  if (selectedIds.value.length === 0) return
  updateDemoAuditRecordsBatch(selectedIds.value, {
    status: 'rejected',
    rejectReason: '批量驳回，请补充说明后重新提交。'
  })
  refreshRecords()
  selectedIds.value = []
  showSuccessToast('批量驳回完成')
}
</script>

<style scoped>
.toolbar-card {
  margin-top: 16px;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.toolbar-text {
  font-size: 13px;
  color: #475569;
}

.batch-actions {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audit-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audit-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.audit-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audit-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.audit-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.audit-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.audit-meta,
.audit-desc {
  font-size: 13px;
  color: #64748b;
}

.audit-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  max-height: 84vh;
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

.form-card {
  margin-top: 18px;
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.level-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.level-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: #e2e8f0;
}

.level-chip.active {
  background: #dbeafe;
}

.level-chip-text {
  font-size: 13px;
  color: #334155;
}

.detail-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
