<template>
  <view class="page page-with-nav">
    <view class="section-title">{{ pageTitle }}</view>

    <view class="filter-row">
      <u-input
        v-model="selectedYear"
        readonly
        placeholder="选择年度"
        @click="showYearPicker = true"
      />
    </view>

    <view v-if="records.length > 0" class="record-list">
      <view v-for="record in records" :key="record.id" class="record-card" @click="showDetail(record)">
        <text class="record-title">{{ record.title }}</text>
        <text class="record-points">审核积分：{{ record.approvedPoints }} 分</text>
        <text class="record-time">活动时间：{{ record.activityTime }}</text>
      </view>
    </view>

    <view v-else class="empty-card">
      <text class="empty-text">当前年度暂无审核通过的打卡记录</text>
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
          <view class="detail-row">
            <text class="detail-label">佐证材料</text>
            <text class="detail-text">{{ selectedRecord.evidenceFiles.join('、') }}</text>
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
import { onLoad } from '@dcloudio/uni-app'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { getVolunteerModule } from '@/utils/rules'
import { getVolunteerRecordList } from '@/utils/mockData'

/** 志愿服务打卡记录页，支持按年度查看审核通过记录。 */

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, idx) => String(currentYear - idx))

const showYearPicker = ref(false)
const selectedYear = ref(String(currentYear))
const moduleId = ref('')
const selectedRecord = ref(null)
const pageTitle = computed(() => {
  const moduleInfo = getVolunteerModule(moduleId.value)
  return moduleInfo ? `${moduleInfo.name}打卡记录` : '打卡记录'
})
const records = computed(() =>
  getVolunteerRecordList({
    year: selectedYear.value,
    moduleId: moduleId.value
  })
)

/** 接收上一个页面传入的模块标识。 */
onLoad((options) => {
  moduleId.value = options?.moduleId || ''
})

/** 切换年份后刷新记录列表。 */
const onYearConfirm = (value) => {
  selectedYear.value = value?.value?.[0] || selectedYear.value
  showYearPicker.value = false
}

/** 打开记录详情。 */
const showDetail = (record) => {
  selectedRecord.value = record
}

/** 关闭记录详情。 */
const closeDetail = () => {
  selectedRecord.value = null
}
</script>

<style scoped>
.filter-row {
  margin-bottom: 16px;
}

.record-list {
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

.record-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.record-points,
.record-time {
  font-size: 13px;
  color: #475569;
}

.empty-card {
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

.detail-actions {
  margin-top: 20px;
}
</style>
