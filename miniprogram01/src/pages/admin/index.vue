<template>
  <view class="page page-with-tabbar">
    <u-icon v-if="false" name="close" />
    <view class="section-title text-center">管理后台</view>
    <view class="summary-grid">
      <view class="summary-card volunteer">
        <text class="summary-label">待审志愿服务</text>
        <text class="summary-value">{{ summary.pendingVolunteerCount }}</text>
      </view>
      <view class="summary-card honor">
        <text class="summary-label">待审荣誉获奖</text>
        <text class="summary-value">{{ summary.pendingHonorCount }}</text>
      </view>
      <view class="summary-card approved">
        <text class="summary-label">已审核</text>
        <text class="summary-value">{{ summary.approvedCount }}</text>
      </view>
      <view class="summary-card rejected">
        <text class="summary-label">已驳回</text>
        <text class="summary-value">{{ summary.rejectedCount }}</text>
      </view>
    </view>

    <view class="card-list">
      <view v-if="userStore.isAdmin" class="card" @click="goTo('/pages/admin/roles')">
        <text class="card-title">{{ roleEntryTitle }}</text>
        <text class="card-desc">{{ roleEntryDesc }}</text>
      </view>
      <view class="card" @click="goTo('/pages/admin/import')">
        <text class="card-title">批量数据导入</text>
        <text class="card-desc">查看模板字段并提交导入任务</text>
      </view>
      <view class="card" @click="goTo('/pages/admin/audit')">
        <text class="card-title">数据审核</text>
        <text class="card-desc">处理志愿与荣誉申报，支持批量操作</text>
      </view>
      <view class="card" @click="goTo('/pages/admin/export')">
        <text class="card-title">全量数据导出</text>
        <text class="card-desc">按条件筛选并导出真实数据</text>
      </view>
    </view>

    <view class="section-title">最近申报动态</view>
    <view class="log-list">
      <view v-for="item in logs" :key="item.id" class="log-card">
        <text class="log-content">{{ item.content }}</text>
        <text class="log-meta">{{ item.operator }} · {{ item.time }}</text>
      </view>
    </view>
  </view>
  <GlobalBottomNav v-if="userStore.isAdmin" current="admin" :showBack="false" />
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { fetchAdminDashboard } from '@/api/admin'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast } from '@/utils/feedback'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { useUserStore } from '@/store'

/** 管理后台首页，展示审核统计和最近操作日志。 */

const userStore = useUserStore()
const isSuperAdmin = computed(() => userStore.role === 'super-admin')
const roleEntryTitle = computed(() => (isSuperAdmin.value ? '设置管理员' : '禁用用户'))
const roleEntryDesc = computed(() =>
  isSuperAdmin.value
    ? '进入账号列表，一键设为管理员或回收管理员'
    : '进入账号列表，按需禁用普通用户或管理员账号'
)
const summary = ref({
  pendingVolunteerCount: 0,
  pendingHonorCount: 0,
  approvedCount: 0,
  rejectedCount: 0
})
const logs = ref([])

/** 跳转到具体管理功能页。 */
const goTo = (url) => {
  uni.navigateTo({ url })
}

/** 刷新管理首页统计与动态。 */
const loadDashboard = async () => {
  try {
    const data = unwrapApiData(await fetchAdminDashboard(), { summary: {}, logs: [] })
    summary.value = {
      pendingVolunteerCount: Number(data.summary?.pendingVolunteerCount || 0),
      pendingHonorCount: Number(data.summary?.pendingHonorCount || 0),
      approvedCount: Number(data.summary?.approvedCount || 0),
      rejectedCount: Number(data.summary?.rejectedCount || 0)
    }

    logs.value = (data.logs || []).map((item) => ({
      id: item.id,
      operator: item.applicantName || '未知用户',
      time: item.submitTime || '',
      content: `${item.type === 'volunteer' ? '志愿服务' : '荣誉获奖'}：${item.title || ''}（${item.statusText || '待审核'}）`
    }))
  } catch (error) {
    showErrorToast(resolveApiErrorMessage(error, '管理数据加载失败，请稍后重试'))
    summary.value = {
      pendingVolunteerCount: 0,
      pendingHonorCount: 0,
      approvedCount: 0,
      rejectedCount: 0
    }
    logs.value = []
  }
}

/** 页面展示时刷新统计与日志，并同步 TabBar 选中状态。 */
onShow(() => {
  uni.hideTabBar()
  loadDashboard()
})
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card {
  border-radius: 16px;
  padding: 18px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.summary-card.volunteer {
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.summary-card.honor {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}

.summary-card.approved {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
}

.summary-card.rejected {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}

.summary-label {
  font-size: 14px;
  line-height: 1.6;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
}

.card-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.card {
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.card-desc {
  font-size: 15px;
  color: #334155;
  line-height: 1.7;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.log-card {
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #e2e8f0;
}

.log-content {
  font-size: 15px;
  color: #111827;
  line-height: 1.7;
}

.log-meta {
  font-size: 13px;
  color: #475569;
}

.text-center {
  text-align: center;
}

.section-title {
  font-size: 22px;
  font-weight: 800;
  color: #333333;
  margin: 20px 0;
}

.page-with-tabbar {
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
}
</style>



