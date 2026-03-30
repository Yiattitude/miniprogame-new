<template>
  <view class="page page-with-nav">
    <view class="section-title">全量数据导出</view>
    <text class="helper-text">请先选择筛选条件，再查看导出预览。未选择时将展示全部真实审核数据。</text>
    <view class="form-card">
      <u-form :model="form" labelPosition="top">
        <!-- 年度选择 -->
        <u-form-item label="年度">
          <u-picker
            v-model="showYearPicker"
            :range="yearOptions"
            @confirm="onYearConfirm"
            @cancel="showYearPicker = false"
          >
            <view class="picker-input">
              <text>{{ form.year || '请选择' }}</text>
              <uni-icons type="arrow-down" size="16" color="#999999"></uni-icons>
            </view>
          </u-picker>
        </u-form-item>

        <!-- 模块 / 荣誉级别选择 -->
        <u-form-item label="模块 / 荣誉级别">
          <u-picker
            v-model="showModulePicker"
            :range="moduleOptions"
            @confirm="onModuleConfirm"
            @cancel="showModulePicker = false"
          >
            <view class="picker-input">
              <text>{{ form.module || '请选择' }}</text>
              <uni-icons type="arrow-down" size="16" color="#999999"></uni-icons>
            </view>
          </u-picker>
        </u-form-item>

        <!-- 审核状态选择 -->
        <u-form-item label="审核状态">
          <u-picker
            v-model="showStatusPicker"
            :range="statusOptions"
            @confirm="onStatusConfirm"
            @cancel="showStatusPicker = false"
          >
            <view class="picker-input">
              <text>{{ form.status || '请选择' }}</text>
              <uni-icons type="arrow-down" size="16" color="#999999"></uni-icons>
            </view>
          </u-picker>
        </u-form-item>

        <!-- 用户选择 -->
        <u-form-item label="用户">
          <u-picker
            v-model="showUserPicker"
            :range="userOptions"
            @confirm="onUserConfirm"
            @cancel="showUserPicker = false"
          >
            <view class="picker-input">
              <text>{{ form.keyword || '请选择' }}</text>
              <uni-icons type="arrow-down" size="16" color="#999999"></uni-icons>
            </view>
          </u-picker>
        </u-form-item>
      </u-form>

      <view class="action-group">
        <u-button type="primary" text="导出 Excel" size="large" @click="handleExport" />
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
import { reactive, ref, watch, computed } from 'vue'
import { exportExcel, fetchAuditList } from '@/api/admin'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

/** 管理后台导出页，按筛选条件预览并导出真实审核数据。 */

const form = reactive({
  year: '',
  module: '',
  status: '',
  keyword: ''
})

const previewRows = ref([])

// 选择框状态
const showYearPicker = ref(false)
const showModulePicker = ref(false)
const showStatusPicker = ref(false)
const showUserPicker = ref(false)

// 年度选项（最近5年）
const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const options = []
  for (let i = 0; i < 5; i++) {
    options.push(`${currentYear - i}`)
  }
  return options
})

// 模块/荣誉级别选项
const moduleOptions = [
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

// 审核状态选项
const statusOptions = [
  '待审核',
  '已审核',
  '已驳回'
]

// 用户选项（模拟数据，实际应从后端获取）
const userOptions = [
  '全部用户',
  '张三',
  '李四',
  '王五',
  '赵六'
]

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
  keyword: form.keyword === '全部用户' ? '' : form.keyword.trim()
})

/** 年度选择确认 */
const onYearConfirm = (e) => {
  form.year = e.value[0]
  showYearPicker.value = false
}

/** 模块选择确认 */
const onModuleConfirm = (e) => {
  form.module = e.value[0]
  showModulePicker.value = false
}

/** 状态选择确认 */
const onStatusConfirm = (e) => {
  form.status = e.value[0]
  showStatusPicker.value = false
}

/** 用户选择确认 */
const onUserConfirm = (e) => {
  form.keyword = e.value[0]
  showUserPicker.value = false
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
.form-card {
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  margin-bottom: 18px;
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

/* 选择框样式 */
.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s ease;
}

.picker-input:hover {
  border-color: #0076FF;
  box-shadow: 0 0 0 2px rgba(0, 118, 255, 0.1);
}

.picker-input text {
  font-size: 16px;
  color: #333333;
}

.picker-input text:empty {
  color: #999999;
}
</style>


