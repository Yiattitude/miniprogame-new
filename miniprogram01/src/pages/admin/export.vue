<template>
  <view class="page page-with-nav">
    <view class="section-title">全量数据导出</view>
    <text class="helper-text">请选择筛选条件后导出，未填写时默认导出全部真实审核数据。</text>

    <view class="form-card">
      <view class="form-item">
        <text class="form-label">年度</text>
        <picker :range="yearOptions" :value="yearIndex" @change="onYearChange">
          <view class="picker-input">
            <text>{{ form.year || '全部年度' }}</text>
            <uni-icons type="arrow-down" size="16" color="#999999" />
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">模块 / 荣誉级别</text>
        <picker :range="moduleOptions" :value="moduleIndex" @change="onModuleChange">
          <view class="picker-input">
            <text>{{ form.module || '全部类型' }}</text>
            <uni-icons type="arrow-down" size="16" color="#999999" />
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">审核状态</text>
        <picker :range="statusOptions" :value="statusIndex" @change="onStatusChange">
          <view class="picker-input">
            <text>{{ form.status || '全部状态' }}</text>
            <uni-icons type="arrow-down" size="16" color="#999999" />
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">用户关键词</text>
        <u-input v-model="form.keyword" placeholder="请输入用户姓名或邀请码" clearable @change="loadPreview" />
      </view>

      <view class="action-group">
        <u-button type="primary" text="导出文件" size="large" @click="handleExport" />
        <u-button type="info" plain text="重置筛选" size="large" @click="handleReset" />
      </view>
    </view>

    <view class="section-title">导出预览</view>
    <text class="preview-desc">当前筛选结果共 {{ previewRows.length }} 条</text>

    <view v-if="previewRows.length > 0" class="preview-list">
      <view v-for="item in previewRows" :key="item.id" class="preview-card">
        <text class="preview-name">{{ item.title }}</text>
        <text class="preview-meta">{{ item.applicantName }} · {{ item.typeLabel }}</text>
        <text class="preview-meta">{{ item.moduleLabel }} · {{ item.statusText }} · {{ item.scoreText }}</text>
        <text class="preview-meta">提交时间：{{ item.submitTime }}</text>
      </view>
    </view>

    <view v-else class="empty-card">
      <text class="empty-text">当前筛选条件下没有可导出的记录</text>
    </view>

    <GlobalBottomNav current="admin" />
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, reactive, ref } from 'vue'
import { exportExcel, fetchAuditList } from '@/api/admin'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import { downloadRemoteFile, getCloudTempUrl, saveLocalFile } from '@/utils/upload'

/** 管理后台导出页，按筛选条件预览并导出真实审核数据。 */
const yearOptions = ['全部年度']
const currentYear = new Date().getFullYear()
for (let i = 0; i < 6; i += 1) {
  yearOptions.push(`${currentYear - i}`)
}

const moduleOptions = [
  '全部类型',
  '传承红色文化',
  '参与基层治理',
  '服务企业发展',
  '实施以老助老',
  '其他服务',
  '国家级荣誉',
  '省部级荣誉',
  '厅局级荣誉',
  '厂处级荣誉'
]

const statusOptions = ['全部状态', '待审核', '已审核', '已驳回']

const form = reactive({
  year: '',
  module: '',
  status: '',
  keyword: ''
})

const previewRows = ref([])

/** 计算 picker 当前索引，保证重置时能回到“全部”。 */
const yearIndex = computed(() => Math.max(yearOptions.indexOf(form.year || '全部年度'), 0))
const moduleIndex = computed(() => Math.max(moduleOptions.indexOf(form.module || '全部类型'), 0))
const statusIndex = computed(() => Math.max(statusOptions.indexOf(form.status || '全部状态'), 0))

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

/** 年度切换。 */
const onYearChange = (event) => {
  const value = yearOptions[Number(event.detail.value || 0)] || '全部年度'
  form.year = value === '全部年度' ? '' : value
  loadPreview()
}

/** 模块 / 荣誉级别切换。 */
const onModuleChange = (event) => {
  const value = moduleOptions[Number(event.detail.value || 0)] || '全部类型'
  form.module = value === '全部类型' ? '' : value
  loadPreview()
}

/** 审核状态切换。 */
const onStatusChange = (event) => {
  const value = statusOptions[Number(event.detail.value || 0)] || '全部状态'
  form.status = value === '全部状态' ? '' : value
  loadPreview()
}

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

/** 调用后端导出接口，并直接打开导出的真实文件。 */
const handleExport = async () => {
  try {
    uni.showLoading({ title: '导出中', mask: true })
    const data = unwrapApiData(await exportExcel(buildQuery()), {})
    uni.hideLoading()

    if (Number(data.total || 0) === 0) {
      showSuccessToast('当前筛选条件下暂无可导出数据')
      return
    }

    if (!data.fileID) {
      throw new Error('导出文件生成失败')
    }

    showSuccessToast(`导出完成，共 ${Number(data.total || 0)} 条`)
    const tempUrl = await getCloudTempUrl(data.fileID)
    const tempFilePath = await downloadRemoteFile(tempUrl)
    const savedFilePath = await saveLocalFile(tempFilePath)
    try {
      await new Promise((resolve, reject) => {
        uni.openDocument({
          filePath: savedFilePath,
          fileType: 'xlsx',
          showMenu: true,
          success: () => resolve(true),
          fail: (error) => reject(error || new Error('文件打开失败'))
        })
      })
    } catch (openError) {
      uni.showModal({
        title: '导出成功',
        content: `Excel 文件已保存到本地，但系统打开失败。您可以稍后在小程序本地文件中查看。\n\n保存路径：${savedFilePath}`,
        showCancel: false
      })
    }
  } catch (error) {
    uni.hideLoading()
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

onShow(() => {
  loadPreview()
})
</script>

<style scoped>
.form-card {
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  margin-bottom: 18px;
  background: #ffffff;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.action-group {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.helper-text {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
}

.preview-desc {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.preview-card {
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.preview-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  line-height: 1.7;
}

.preview-meta {
  font-size: 13px;
  color: #475569;
}

.empty-card {
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
}

.section-title {
  font-size: 22px;
  font-weight: 800;
  color: #333333;
  margin: 20px 0;
}

.page-with-nav {
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}

.picker-input text {
  font-size: 16px;
  color: #333333;
}
</style>
