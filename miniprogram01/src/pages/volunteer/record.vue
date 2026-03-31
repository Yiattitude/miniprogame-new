<template>
  <view class="page page-with-nav">
    <view class="page-header">
      <text class="page-title">{{ pageTitle }}</text>
    </view>

    <view class="filter-row">
      <view class="year-selector" @click="showYearPicker = true">
        <text class="year-text">{{ selectedYear }}年度 ▼</text>
      </view>
    </view>

    <view v-if="records.length > 0" class="record-list">
      <view v-for="record in records" :key="record.id" class="record-card" @click="showDetail(record)">
        <view class="card-header">
          <text class="record-title">{{ record.title }}</text>
          <text class="record-points">+ {{ record.approvedPoints || record.points || 0 }}分</text>
        </view>
        <view class="card-body">
          <text class="record-time">{{ record.activityTime }}</text>
        </view>
        <view class="card-footer">
          <text class="status-badge" :class="getBadgeClass(record.statusText)">
            {{ record.statusText }}
          </text>
        </view>
      </view>
    </view>

    <view v-else class="empty-card">
      <text class="empty-text">当前年度暂无打卡记录</text>
    </view>

    <u-picker
      :show="showYearPicker"
      :columns="[yearOptions]"
      @confirm="onYearConfirm"
      @cancel="showYearPicker = false"
    />

    <view v-if="selectedRecord" class="detail-mask" @click.self="closeDetail">
      <view class="detail-panel">
        <text class="detail-title">{{ selectedRecord.title }}</text>
        <view class="detail-grid">
          <view class="detail-row">
            <text class="detail-label">活动时间</text>
            <text class="detail-text">{{ selectedRecord.activityTime }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">活动地点</text>
            <text class="detail-text">{{ selectedRecord.location }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">参与内容</text>
            <text class="detail-text">{{ selectedRecord.content }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">审核状态</text>
            <text class="detail-text">{{ selectedRecord.statusText }}</text>
          </view>
          <view class="detail-row" v-if="selectedRecord.rejectReason">
            <text class="detail-label">驳回原因</text>
            <text class="detail-text">{{ selectedRecord.rejectReason }}</text>
          </view>
          <view class="detail-row" v-if="selectedRecord.evidenceFiles && selectedRecord.evidenceFiles.length">
            <text class="detail-label">佐证材料</text>
            <view class="evidence-list">
              <text
                v-for="(file, fileIndex) in selectedRecord.evidenceFiles"
                :key="`${selectedRecord.id}-evidence-${fileIndex}`"
                class="evidence-item"
                @click="openEvidenceFile(file)"
              >
                {{ resolveEvidenceName(file, fileIndex) }}
              </text>
            </view>
          </view>
        </view>

        <view class="detail-actions">
          <u-button type="info" plain text="关闭" size="large" @click="closeDetail" />
        </view>
      </view>
    </view>

    <GlobalBottomNav current="index" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { fetchVolunteerRecords } from '@/api/volunteer'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast } from '@/utils/feedback'
import { getVolunteerModule } from '@/utils/rules'
import { previewCloudFile, resolveFileName } from '@/utils/upload'

/** 志愿服务打卡记录页，支持按年度查看审核通过记录。 */

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, idx) => String(currentYear - idx))

const showYearPicker = ref(false)
const selectedYear = ref(String(currentYear))
const moduleId = ref('')
const selectedRecord = ref(null)
const records = ref([])

const pageTitle = computed(() => {
  const moduleInfo = getVolunteerModule(moduleId.value)
  return moduleInfo ? `${moduleInfo.name}打卡记录` : '我的打卡记录'
})

/** 按当前筛选条件加载志愿记录。 */
const loadRecords = async () => {
  try {
    const responseData = unwrapApiData(
      await fetchVolunteerRecords({
        year: selectedYear.value,
        moduleId: moduleId.value,
        page: 1,
        pageSize: 50
      }),
      { list: [] }
    )
    records.value = (responseData.list || []).map((item) => ({
      ...item,
      activityTime: item.activityTime || '',
      evidenceFiles: Array.isArray(item.evidenceFiles) ? item.evidenceFiles : []
    }))
  } catch (error) {
    showErrorToast(resolveApiErrorMessage(error, '记录加载失败，请稍后重试'))
    records.value = []
  }
}

/** 接收上一个页面传入的模块标识。 */
onLoad((options) => {
  moduleId.value = options?.moduleId || ''
  loadRecords()
})

/** 切换年份后刷新记录列表。 */
const onYearConfirm = (value) => {
  selectedYear.value = value?.value?.[0] || selectedYear.value
  showYearPicker.value = false
  loadRecords()
}

/** 打开记录详情。 */
const showDetail = (record) => {
  selectedRecord.value = record
}

/** 将附件字段转换为更易读的文件名。 */
const resolveEvidenceName = (file, index) => {
  const fileRef = typeof file === 'string' ? file : file?.fileID || file?.url || ''
  const name = typeof file === 'object' ? file?.name || '' : ''
  return name || resolveFileName(fileRef) || `附件${index + 1}`
}

/** 打开打卡详情中的佐证材料。 */
const openEvidenceFile = async (file) => {
  const fileRef = typeof file === 'string' ? file : file?.fileID || file?.url || ''
  await previewCloudFile(fileRef, {
    fileName: typeof file === 'object' ? file?.name || '' : ''
  })
}

/** 关闭记录详情。 */
const closeDetail = () => {
  selectedRecord.value = null
}

const getBadgeClass = (status) => {
  if (status === '已通过') return 'badge-success'
  if (status === '待审核') return 'badge-pending'
  if (status === '已驳回') return 'badge-reject'
  return 'badge-default'
}

/** 页面回显时刷新最新记录。 */
onShow(() => {
  loadRecords()
})
</script>

<style scoped>
.page {
  background-color: #f5f6fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

.page-header {
  padding: 30px 20px 20px;
  text-align: center;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #333333;
  letter-spacing: 1px;
}

.filter-row {
  display: flex;
  justify-content: flex-end;
  padding: 0 16px;
  margin-bottom: 16px;
}

.year-selector {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
}

.year-text {
  font-size: 15px;
  color: #333333;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px 20px;
}

.record-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evidence-item {
  font-size: 13px;
  color: #0076ff;
  text-decoration: underline;
  line-height: 1.6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-title {
  font-size: 19px;
  font-weight: 800;
  color: #333333;
}

.record-points {
  font-size: 20px;
  font-weight: bold;
  color: #0076FF;
}

.card-body {
  margin-top: 4px;
}

.record-time {
  font-size: 16px;
  color: #7B7898;
}

.card-footer {
  margin-top: 8px;
  display: flex;
}

.status-badge {
  font-size: 13px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 6px;
}

.badge-success {
  background-color: #e6f7eb;
  color: #00a854;
}

.badge-pending {
  background-color: #fff2e8;
  color: #d88949;
}

.badge-reject {
  background-color: #feeceb;
  color: #ff4d4f;
}

.badge-default {
  background-color: #f0f0f0;
  color: #666666;
}

.empty-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 20px;
  margin: 0 16px;
  text-align: center;
}

.empty-text {
  font-size: 15px;
  color: #999999;
}

/* 详情弹窗样式 */
.detail-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.detail-panel {
  width: 100%;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.detail-title {
  font-size: 20px;
  font-weight: 800;
  color: #333333;
  margin-bottom: 24px;
  display: block;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  color: #999999;
}

.detail-text {
  font-size: 16px;
  color: #333333;
}

.detail-actions {
  margin-top: 10px;
}
</style>
<<<<<<< HEAD


=======


>>>>>>> 878cd6bb1484add6c8c69c532b51c57c09a991eb
