<template>
  <view class="page">
    <view class="section-title">管理后台</view>
    <view class="card-list">
      <view class="card" @click="goTo('/pages/admin/admin-import')">
        <text class="card-title">批量数据导入</text>
        <text class="card-desc">上传 Excel 模板</text>
      </view>
      <view class="card" @click="goTo('/pages/admin/admin-audit')">
        <text class="card-title">数据审核</text>
        <text class="card-desc">处理志愿与荣誉申报</text>
      </view>
      <view class="card" @click="goTo('/pages/admin/admin-export')">
        <text class="card-title">全量数据导出</text>
        <text class="card-desc">按条件导出 Excel</text>
      </view>
      <view class="card" @click="goTo('/pages/admin/admin-logs')">
        <text class="card-title">操作日志</text>
        <text class="card-desc">查看操作记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { setTabBarIndex } from '@/utils/tabbar'

const goTo = (url) => {
  uni.navigateTo({ url })
}

onShow(() => {
  setTabBarIndex(2)
})
</script>

<style scoped>
.card-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
