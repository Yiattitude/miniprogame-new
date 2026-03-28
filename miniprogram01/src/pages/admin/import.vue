<template>
  <view class="page page-with-nav">
    <view class="section-title">批量数据导入</view>
    <view class="notice-card">
      <text class="notice-title">前端演示说明</text>
      <text class="notice-desc">当前页面使用本地 mock 数据模拟导入流程，后续可直接替换为真实上传接口。</text>
    </view>

    <view class="card">
      <text class="card-title">Excel 模板下载</text>
      <text class="card-desc">包含志愿服务与荣誉获奖字段</text>
      <u-button type="primary" text="下载模板" size="large" @click="downloadTemplate" />
    </view>

    <view class="card">
      <text class="card-title">上传 Excel</text>
      <text class="card-desc">前端阶段先模拟导入成功和历史留痕</text>
      <u-button type="info" text="选择文件" size="large" @click="uploadFile" />
    </view>

    <view class="card">
      <text class="card-title">模板字段预览</text>
      <view class="field-group">
        <text class="field-title">志愿服务模板字段</text>
        <text class="field-text">{{ templateFields.volunteer.join('、') }}</text>
      </view>
      <view class="field-group">
        <text class="field-title">荣誉获奖模板字段</text>
        <text class="field-text">{{ templateFields.honor.join('、') }}</text>
      </view>
    </view>

    <view class="section-title">导入历史</view>
    <view class="history-list">
      <view v-for="item in history" :key="item.id" class="history-card">
        <text class="history-name">{{ item.fileName }}</text>
        <text class="history-meta">导入条数：{{ item.importedCount }} 条</text>
        <text class="history-meta">操作人：{{ item.operator }} · {{ item.time }}</text>
      </view>
    </view>

    <GlobalBottomNav current="mine" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { showSuccessToast } from '@/utils/feedback'
import { getImportHistory, getImportTemplateFields, simulateImportHistory } from '@/utils/mockData'

/** 管理后台导入页，展示模板字段并模拟导入记录。 */

const templateFields = getImportTemplateFields()
const history = ref(getImportHistory())

/** 展示模板字段说明，方便后端联调时核对 Excel 结构。 */
const downloadTemplate = () => {
  uni.showModal({
    title: '模板字段说明',
    content: `志愿服务：${templateFields.volunteer.join('、')}\n\n荣誉获奖：${templateFields.honor.join('、')}`,
    showCancel: false
  })
}

/** 前端阶段先模拟导入完成并写入本地历史。 */
const uploadFile = () => {
  history.value = simulateImportHistory()
  showSuccessToast('已完成前端导入演示')
}
</script>

<style scoped>
.notice-card {
  background: linear-gradient(135deg, #eff6ff, #e0f2fe);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.notice-desc {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
}

.card-desc {
  font-size: 14px;
  color: #64748b;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.field-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.7;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.history-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.history-meta {
  font-size: 13px;
  color: #64748b;
}
</style>
