<template>
  <view class="page page-with-nav">
    <view class="section-title">批量数据导入</view>
    <view class="notice-card">
      <text class="notice-title">导入说明</text>
      <text class="notice-desc">
        请先下载模板并按字段填写，再上传 Excel 文件。系统支持 `.xlsx`、`.xls`、`.csv`，导入成功后会自动写入真实数据。
      </text>
    </view>

    <view class="card">
      <text class="card-title">Excel 模板下载</text>
      <text class="card-desc">模板包含“志愿服务”“荣誉获奖”“字段说明”三个工作表，并附带示例行</text>
      <u-button type="primary" text="下载模板" size="large" @click="downloadTemplate" />
    </view>

    <view class="card">
      <text class="card-title">上传 Excel</text>
      <text class="card-desc">{{ currentFileName ? `当前已选择：${currentFileName}` : '支持 .xlsx / .xls / .csv 文件' }}</text>
      <u-button type="info" text="选择并导入" size="large" @click="uploadFile" />
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
      <text class="field-tip">说明：“邀请码”字段当前实际匹配的是用户手机号；模块标识和荣誉级别请查看模板里的“字段说明”工作表。</text>
    </view>

    <view class="section-title">导入历史</view>
    <view v-if="history.length > 0" class="history-list">
      <view v-for="item in history" :key="item.id" class="history-card">
        <text class="history-name">{{ item.fileName }}</text>
        <text class="history-meta">志愿服务：{{ item.importedVolunteer }} 条</text>
        <text class="history-meta">荣誉获奖：{{ item.importedHonor }} 条</text>
        <text class="history-meta">失败条数：{{ item.failedCount }} 条</text>
        <text class="history-meta">操作时间：{{ item.time }}</text>
        <view v-if="item.failed.length > 0" class="failed-list">
          <text v-for="(failedItem, failedIndex) in item.failed.slice(0, 3)" :key="`${item.id}-${failedIndex}`" class="failed-text">
            {{ failedItem.type === 'honor' ? '荣誉' : '志愿' }}：{{ failedItem.reason }}
          </text>
        </view>
      </view>
    </view>
    <view v-else class="empty-card">
      <text class="empty-text">暂无导入记录</text>
    </view>

    <GlobalBottomNav current="admin" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { fetchImportTemplate, importExcel } from '@/api/admin'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'
import { downloadRemoteFile, getCloudTempUrl, saveLocalFile, uploadLocalFileToCloud } from '@/utils/upload'

/** 管理后台导入页，负责模板下载、Excel 上传与导入结果展示。 */
const templateFields = {
  volunteer: ['用户姓名', '邀请码', '模块标识', '活动名称', '时间', '地点', '参与内容', '积分'],
  honor: ['用户姓名', '邀请码', '荣誉级别', '荣誉名称', '获取时间', '授奖单位', '积分']
}
const history = ref([])
const currentFileName = ref('')

/** 下载并打开后端生成的真实 Excel 模板。 */
const downloadTemplate = async () => {
  try {
    uni.showLoading({ title: '模板生成中', mask: true })
    const data = unwrapApiData(await fetchImportTemplate(), {})
    if (!data.fileID) {
      throw new Error('模板生成失败')
    }

    const tempUrl = await getCloudTempUrl(data.fileID)
    const tempFilePath = await downloadRemoteFile(tempUrl)
    const savedFilePath = await saveLocalFile(tempFilePath)
    uni.hideLoading()

    uni.showModal({
      title: '模板已保存',
      content: `模板已保存到小程序本地文件，可直接打开使用。\n\n保存路径：${savedFilePath}`,
      confirmText: '立即打开',
      cancelText: '知道了',
      success: (res) => {
        if (!res.confirm) return
        uni.openDocument({
          filePath: savedFilePath,
          fileType: 'xlsx',
          showMenu: true,
          fail: () => {
            showErrorToast('模板已保存，但打开失败，请稍后重试')
          }
        })
      }
    })
  } catch (error) {
    uni.hideLoading()
    showErrorToast(resolveApiErrorMessage(error, '模板下载失败，请稍后重试'))
  }
}

/** 选择 Excel 后先上传到云存储，再调用后端解析导入。 */
const uploadFile = () => {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['xlsx', 'xls', 'csv'],
    success: async (res) => {
      const file = res?.tempFiles?.[0]
      const filePath = file?.path || file?.tempFilePath || ''
      if (!file || !filePath) {
        showErrorToast('未选择有效文件')
        return
      }

      currentFileName.value = file.name || '未命名文件'

      try {
        uni.showLoading({ title: '上传并导入中', mask: true })
        const uploadRes = await uploadLocalFileToCloud({
          filePath,
          fileName: file.name || 'admin-import.xlsx',
          folder: 'admin-imports'
        })
        const importData = unwrapApiData(
          await importExcel({
            fileName: file.name || '',
            fileID: uploadRes.fileID
          }),
          {}
        )
        uni.hideLoading()

        history.value = [
          {
            id: `${Date.now()}`,
            fileName: file.name || '未命名文件',
            importedVolunteer: Number(importData.importedVolunteer || 0),
            importedHonor: Number(importData.importedHonor || 0),
            failedCount: Number(importData.failedCount || 0),
            failed: Array.isArray(importData.failed) ? importData.failed : [],
            time: new Date().toLocaleString()
          },
          ...history.value
        ]

        showSuccessToast(
          `导入完成：志愿 ${Number(importData.importedVolunteer || 0)} 条，荣誉 ${Number(importData.importedHonor || 0)} 条`
        )
      } catch (error) {
        uni.hideLoading()
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

.field-text,
.field-tip {
  font-size: 13px;
  color: #475569;
  line-height: 1.7;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card,
.empty-card {
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

.history-meta,
.empty-text,
.failed-text {
  font-size: 13px;
  color: #64748b;
}

.failed-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}
</style>
