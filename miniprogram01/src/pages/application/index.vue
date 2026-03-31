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
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { fetchHonorRecords } from '@/api/honor'
import { fetchVolunteerRecords } from '@/api/volunteer'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { useUserStore } from '@/store'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'
import { ensureComplianceReady } from '@/utils/auth'
import { getHonorLevel, getVolunteerModule } from '@/utils/rules'
import { previewCloudFile, resolveFileName } from '@/utils/upload'

/** 我的申请页面，展示待审核、已通过、已驳回记录，并支持驳回后重提。 */

const tabs = [
  { name: '待审核' },
  { name: '已通过' },
  { name: '已驳回' }
]

const current = ref(0)
const records = ref([])
const selectedRecord = ref(null)
const userStore = useUserStore()
const stats = computed(() => ({
  pending: records.value.filter((item) => item.status === 'pending').length,
  approved: records.value.filter((item) => item.status === 'approved').length,
  rejected: records.value.filter((item) => item.status === 'rejected').length
}))

/** 批量拉取某个接口的全部分页数据。 */
const fetchAllPages = async (fetcher, params = {}) => {
  const result = []
  let page = 1
  const pageSize = 50
  let total = 0

  do {
    const data = unwrapApiData(await fetcher({ ...params, page, pageSize }), { list: [], total: 0 })
    const list = Array.isArray(data.list) ? data.list : []
    total = Number(data.total || 0)
    result.push(...list)
    if (list.length < pageSize) {
      break
    }
    page += 1
  } while (result.length < total)

  return result
}

/** 映射志愿记录为页面统一展示结构。 */
const mapVolunteerRecord = (item = {}) => ({
  id: item.id,
  type: 'volunteer',
  moduleId: item.moduleId || '',
  title: item.title || '志愿服务申报',
  categoryName: item.categoryName || getVolunteerModule(item.moduleId)?.name || '志愿服务',
  activityTime: item.activityTime || '',
  submitTime: item.submitTime || item.activityTime || '',
  location: item.location || '',
  organization: '',
  content: item.content || '',
  claimedPoints: Number(item.claimedPoints || item.points || 0),
  approvedPoints: Number(item.approvedPoints || 0),
  status: item.status || 'pending',
  statusText: item.statusText || '待审核',
  tagType: item.tagType || 'warning',
  rejectReason: item.rejectReason || '',
  evidenceFiles: Array.isArray(item.evidenceFiles) ? item.evidenceFiles : []
})

/** 映射荣誉记录为页面统一展示结构。 */
const mapHonorRecord = (item = {}) => ({
  id: item.id,
  type: 'honor',
  levelId: item.levelId || '',
  title: item.title || '荣誉获奖申报',
  categoryName: item.categoryName || getHonorLevel(item.levelId)?.name || '荣誉获奖',
  activityTime: item.activityTime || '',
  submitTime: item.submitTime || item.activityTime || '',
  location: '',
  organization: item.organization || '',
  content: item.content || item.title || '',
  claimedPoints: Number(item.claimedPoints || item.points || 0),
  approvedPoints: Number(item.approvedPoints || 0),
  status: item.status || 'pending',
  statusText: item.statusText || '待审核',
  tagType: item.tagType || 'warning',
  rejectReason: item.rejectReason || '',
  evidenceFiles: Array.isArray(item.evidenceFiles) ? item.evidenceFiles : []
})

/** 拉取并合并真实申请记录。 */
const loadRecords = async () => {
  if (!ensureComplianceReady(userStore, { redirect: true, toast: false })) {
    return
  }

  try {
    const [volunteerList, honorList] = await Promise.all([
      fetchAllPages(fetchVolunteerRecords),
      fetchAllPages(fetchHonorRecords)
    ])

    records.value = [
      ...volunteerList.map(mapVolunteerRecord),
      ...honorList.map(mapHonorRecord)
    ].sort((left, right) => new Date(right.submitTime || 0).getTime() - new Date(left.submitTime || 0).getTime())
  } catch (error) {
    records.value = []
    showErrorToast(resolveApiErrorMessage(error, '申请记录加载失败，请稍后重试'))
  }
}

const filtered = computed(() => {
  const statusKey = ['pending', 'approved', 'rejected'][current.value]
  return records.value
    .filter((item) => item.status === statusKey)
    .map((item) => ({
      ...item,
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

/** 将附件字段转换为更易读的文件名。 */
const resolveEvidenceName = (file, index) => {
  const fileRef = typeof file === 'string' ? file : file?.fileID || file?.url || ''
  const name = typeof file === 'object' ? file?.name || '' : ''
  return name || resolveFileName(fileRef) || `附件${index + 1}`
}

/** 打开申请详情中的佐证材料。 */
const openEvidenceFile = async (file) => {
  const fileRef = typeof file === 'string' ? file : file?.fileID || file?.url || ''
  await previewCloudFile(fileRef, {
    fileName: typeof file === 'object' ? file?.name || '' : ''
  })
}

/** 关闭申报详情弹层。 */
const closeDetail = () => {
  selectedRecord.value = null
}

/** 驳回记录引导用户回到对应申报页重新提交。 */
const resubmitSelected = () => {
  if (!selectedRecord.value) return
  const record = selectedRecord.value
  closeDetail()
  current.value = 0
  if (record.type === 'volunteer') {
    const volunteerRouteMap = {
      'red-culture': '/pages/volunteer/redCulture',
      'community-governance': '/pages/volunteer/governance',
      'enterprise-service': '/pages/volunteer/enterprise',
      'elder-help': '/pages/volunteer/helpOld',
      'other-service': '/pages/volunteer/other'
    }
    uni.navigateTo({ url: volunteerRouteMap[record.moduleId] || '/pages/volunteer/index' })
    showSuccessToast('请修改后重新提交')
    return
  }
  const honorRouteMap = {
    national: '/pages/honor/national',
    provincial: '/pages/honor/provincial',
    bureau: '/pages/honor/bureau',
    factory: '/pages/honor/factory'
  }
  uni.navigateTo({ url: honorRouteMap[record.levelId] || '/pages/honor/index' })
  showSuccessToast('请修改后重新提交')
}

onShow(() => {
  loadRecords()
})
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
<<<<<<< HEAD


=======


>>>>>>> 878cd6bb1484add6c8c69c532b51c57c09a991eb
