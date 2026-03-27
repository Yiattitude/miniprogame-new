<template>
  <view class="page">
    <view class="section-title">批量数据导入</view>
    <view class="card">
      <text class="card-title">Excel 模板下载</text>
      <text class="card-desc">包含志愿服务与荣誉获奖字段</text>
      <u-button type="primary" text="下载模板" size="large" @click="downloadTemplate" />
    </view>

    <view class="card">
      <text class="card-title">上传 Excel</text>
      <text class="card-desc">自动解析并匹配用户 openid</text>
      <u-button type="info" text="选择文件" size="large" @click="uploadFile" />
    </view>
  </view>
</template>

<script setup>
const downloadTemplate = () => {
  uni.showToast({ title: '模板下载链接待接入', icon: 'none' })
}

const uploadFile = () => {
  uni.showToast({ title: '上传接口待接入', icon: 'none' })
}
</script>

<style scoped>
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
</style>
