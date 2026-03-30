<template>
  <view class="page page-with-nav">
    <view class="section-title">批量数据导入</view>
    <view class="notice-card">
      <text class="notice-title">导入说明</text>
      <text class="notice-desc">请选择 Excel 文件后提交到后端导入接口，导入结果会显示在下方历史列表。</text>
    </view>

    <view class="card">
      <text class="card-title">Excel 模板下载</text>
      <text class="card-desc">包含志愿服务与荣誉获奖字段</text>
      <u-button type="primary" text="下载模板" size="large" @click="downloadTemplate" />
    </view>

    <view class="card">
      <text class="card-title">上传 Excel</text>
      <text class="card-desc">{{ currentFileName ? `当前已选择：${currentFileName}` : '支持 .xlsx / .xls 文件' }}</text>
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
        <text class="history-meta">失败条数：{{ item.failedCount || 0 }} 条</text>
        <text class="history-meta">操作人：{{ item.operator }} · {{ item.time }}</text>
      </view>
    </view>

    <GlobalBottomNav current="mine" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { importExcel } from '@/api/admin'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'

/** 管理后台导入页，展示模板字段并提交真实导入请求。 */

const templateFields = {
  volunteer: ['用户姓名', '身份证号', '模块标识', '活动名称', '时间', '地点', '参与内容', '积分', '佐证材料链接'],
  honor: ['用户姓名', '身份证号', '荣誉级别', '荣誉名称', '获取时间', '授奖单位', '佐证材料链接']
}
const history = ref([])
const currentFileName = ref('')

/** 展示模板字段说明，方便后端联调时核对 Excel 结构。 */
const downloadTemplate = () => {
  uni.showModal({
    title: '模板字段说明',
    content: `志愿服务：${templateFields.volunteer.join('、')}\n\n荣誉获奖：${templateFields.honor.join('、')}`,
    showCancel: false
  })
}

/** 选择 Excel 文件并调用真实导入接口。 */
const uploadFile = () => {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['xlsx', 'xls'],
    success: async (res) => {
      const file = res?.tempFiles?.[0]
      if (!file) {
        showErrorToast('未选择有效文件')
        return
      }

      currentFileName.value = file.name || '未命名文件'

      try {
        const importData = unwrapApiData(
          await importExcel({
            fileName: file.name || '',
            filePath: file.path || '',
            records: []
          }),
          {}
        )
        const importedCount = Number(importData.importedVolunteer || 0) + Number(importData.importedHonor || 0)
        history.value = [
          {
            id: `${Date.now()}`,
            fileName: file.name || '未命名文件',
            importedCount,
            failedCount: Number(importData.failedCount || 0),
            operator: '当前管理员',
            time: new Date().toLocaleString()
          },
          ...history.value
        ]
        showSuccessToast(`导入完成：成功 ${importedCount} 条，失败 ${Number(importData.failedCount || 0)} 条`)
      } catch (error) {
        showErrorToast(resolveApiErrorMessage(error, '导入失败，请稍后重试'))
      }
    },
    fail: () => {
      showErrorToast('文件选择已取消')
    }
  })
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


