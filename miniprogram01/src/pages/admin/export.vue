<template>
  <view class="page page-with-nav">
    <view class="section-title">全量数据导出</view>
    <text class="helper-text">请先填写筛选条件，再查看导出预览。未填写时将展示全部真实审核数据。</text>
    <u-form :model="form" labelPosition="top">
      <u-form-item label="年度">
        <u-input v-model="form.year" placeholder="如 2026" />
      </u-form-item>
      <u-form-item label="模块 / 荣誉级别">
        <u-input v-model="form.module" placeholder="如 传承红色文化" />
      </u-form-item>
      <u-form-item label="审核状态">
        <u-input v-model="form.status" placeholder="如 已审核" />
      </u-form-item>
      <u-form-item label="用户昵称 / 手机号">
        <u-input v-model="form.keyword" placeholder="请输入关键词" />
      </u-form-item>
    </u-form>

    <view class="action-group">
      <u-button type="primary" text="导出 Excel" size="large" @click="handleExport" />
      <u-button type="info" plain text="重置筛选" size="large" @click="handleReset" />
    </view>

    <view class="preview-card">
      <text class="preview-title">导出预览</text>
      <text class="preview-desc">当前筛选结果共 {{ previewRows.length }} 条</text>
    </view>

    <view v-if="previewRows.length > 0" class="preview-list">
      <view v-for="item in previewRows" :key="item.id" class="preview-row">
        <text class="preview-name">{{ item.title }}</text>
        <text class="preview-meta">{{ item.applicantName }} · {{ item.typeLabel }}</text>
        <text class="preview-meta">{{ item.moduleLabel }} · {{ item.statusText }} · {{ item.scoreText }}</text>
        <text class="preview-meta">提交时间：{{ item.submitTime }}</text>
      </view>
    </view>

    <view v-else class="empty-card">
      <text class="empty-text">当前筛选条件下没有可导出的记录</text>
    </view>

    <GlobalBottomNav current="mine" />
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref, watch } from 'vue'
import { exportExcel, fetchAuditList } from '@/api/admin'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'

/** 管理后台导出页，按筛选条件预览并导出真实审核数据。 */

const form = reactive({
  year: '',
  module: '',
  status: '',
  keyword: ''
})

const previewRows = ref([])

/** 标准化状态输入，兼容中文与英文筛选。 */
const normalizeStatus = (value = '') => {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return ''
  if (raw === 'pending' || raw.includes('待')) return 'pending'
  if (raw === 'approved' || raw.includes('通过') || raw.includes('审核')) return 'approved'
  if (raw === 'rejected' || raw.includes('驳回')) return 'rejected'
  return raw
}

/** 生成预览与导出的统一筛选参数。 */
const buildQuery = () => ({
  year: form.year.trim(),
  module: form.module.trim(),
  status: normalizeStatus(form.status),
  keyword: form.keyword.trim()
})

/** 拉取全部预览分页数据。 */
const fetchAllPreviewPages = async () => {
  const list = []
  let page = 1
  const pageSize = 50
  let total = 0

  do {
    const data = unwrapApiData(
      await fetchAuditList({
        ...buildQuery(),
        page,
        pageSize
      }),
      { list: [], total: 0 }
    )
    const currentList = Array.isArray(data.list) ? data.list : []
    total = Number(data.total || 0)
    list.push(...currentList)
    if (currentList.length < pageSize) {
      break
    }
    page += 1
  } while (list.length < total)

  return list
}

/** 拉取导出预览数据。 */
const loadPreview = async () => {
  try {
    const list = await fetchAllPreviewPages()
    previewRows.value = list.map((item) => ({
      id: item.id,
      applicantName: item.applicantName || '未知用户',
      typeLabel: item.type === 'volunteer' ? '志愿服务' : '荣誉获奖',
      moduleLabel: item.categoryName || '',
      title: item.title || '',
      statusText: item.statusText || '',
      scoreText: `${Number(item.claimedPoints || 0)} 分`,
      submitTime: item.submitTime || ''
    }))
  } catch (error) {
    previewRows.value = []
    showErrorToast(resolveApiErrorMessage(error, '预览加载失败，请稍后重试'))
  }
}

/** 调用后端导出接口并提示文件信息。 */
const handleExport = async () => {
  try {
    const data = unwrapApiData(await exportExcel(buildQuery()), {})
    showSuccessToast(`导出完成，共 ${Number(data.total || 0)} 条`)
    if (data.fileID) {
      uni.showModal({
        title: '导出文件',
        content: `文件 ID：${data.fileID}`,
        showCancel: false
      })
    }
  } catch (error) {
    showErrorToast(resolveApiErrorMessage(error, '导出失败，请稍后重试'))
  }
}

/** 清空筛选条件，恢复完整预览列表。 */
const handleReset = () => {
  form.year = ''
  form.module = ''
  form.status = ''
  form.keyword = ''
  loadPreview()
}

watch(
  () => [form.year, form.module, form.status, form.keyword],
  () => {
    loadPreview()
  }
)

onShow(() => {
  loadPreview()
})
</script>

<style scoped>
.action-group {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-card {
  margin-top: 20px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.preview-desc {
  font-size: 14px;
  color: #64748b;
}

.preview-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-row {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.preview-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.preview-meta {
  font-size: 13px;
  color: #64748b;
}

.empty-card {
  margin-top: 12px;
  background: #ffffff;
  border-radius: 12px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
}
</style>


