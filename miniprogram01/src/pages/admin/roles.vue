<template>
  <view class="page page-with-nav page-with-tabbar">
    <view class="section-title">{{ pageTitle }}</view>
    <text class="helper-text">{{ pageHelperText }}</text>

    <view class="search-card">
      <u-search
        v-model="keyword"
        placeholder="按姓名或手机号搜索"
        :showAction="false"
        @search="refreshUsers"
        @custom="refreshUsers"
        @clear="refreshUsers"
      />
    </view>

    <view class="filter-card">
      <text class="filter-title">筛选</text>
      <view class="filter-options">
        <view
          v-for="item in filterOptions"
          :key="item.value"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeFilterValue === item.value }"
          @click="setActiveFilter(item.value)"
        >
          <text class="filter-chip-text">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <view v-if="displayUsers.length > 0" class="user-list">
      <view v-for="item in displayUsers" :key="item._id" class="user-card">
        <view class="user-head">
          <view class="user-main">
            <text class="user-name">{{ item.realName || '未实名用户' }}</text>
            <text class="user-meta">{{ item.phone || '未绑定手机号' }}</text>
          </view>
          <u-tag :text="formatRoleText(item.role)" size="mini" :type="formatRoleTagType(item.role)" />
        </view>

        <view class="action-row">
          <u-button
            v-if="isSuperAdmin && item.role === 'member'"
            type="primary"
            text="设为管理员"
            size="small"
            :loading="submittingId === item._id"
            @click="setRole(item, 'admin')"
          />
          <u-button
            v-else-if="isSuperAdmin && item.role === 'admin'"
            type="info"
            plain
            text="回收管理员"
            size="small"
            :loading="submittingId === item._id"
            @click="setRole(item, 'member')"
          />
          <u-button
            v-else-if="isAdmin && item.role !== 'super-admin' && !item.isDeleted"
            type="error"
            plain
            text="禁用用户"
            size="small"
            :loading="submittingId === item._id"
            @click="disableTargetUser(item)"
          />
          <text v-else-if="item.isDeleted" class="fixed-text">已禁用</text>
          <text v-else class="fixed-text">super-admin 固定角色</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-card">
      <text class="empty-text">暂无可管理用户</text>
    </view>

    <GlobalBottomNav current="admin" />
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { fetchAdminUsers, setUserRole, disableUser } from '@/api/admin'
import GlobalBottomNav from '@/components/GlobalBottomNav.vue'
import { unwrapApiData, resolveApiErrorMessage } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '@/utils/feedback'
import { useUserStore } from '@/store'

/** super-admin 管理员设置页，提供一键设为管理员与回收管理员能力。 */

const keyword = ref('')
const users = ref([])
const submittingId = ref('')
const userStore = useUserStore()
const isSuperAdmin = computed(() => userStore.role === 'super-admin')
const isAdmin = computed(() => userStore.role === 'admin')
const roleFilter = ref('all')
const statusFilter = ref('all')
const pageTitle = computed(() => (isSuperAdmin.value ? '设置管理员' : '禁用用户'))
const pageHelperText = computed(() =>
  isSuperAdmin.value
    ? '仅 super-admin 可操作：支持一键设为管理员 / 回收管理员。'
    : '仅 admin 可操作：支持逻辑禁用用户账号（不可操作 super-admin）。'
)

/** 根据当前身份动态返回筛选项。 */
const filterOptions = computed(() => {
  if (isSuperAdmin.value) {
    return [
      { label: '全部', value: 'all' },
      { label: '普通用户', value: 'member' },
      { label: '管理员', value: 'admin' },
      { label: '超级管理员', value: 'super-admin' }
    ]
  }

  return [
    { label: '全部', value: 'all' },
    { label: '可用账号', value: 'active' },
    { label: '已禁用', value: 'disabled' }
  ]
})

/** 当前选中的筛选值。 */
const activeFilterValue = computed(() => (isSuperAdmin.value ? roleFilter.value : statusFilter.value))

/** 按角色或状态过滤最终展示列表。 */
const displayUsers = computed(() => {
  if (isSuperAdmin.value) {
    if (roleFilter.value === 'all') return users.value
    return users.value.filter((item) => item.role === roleFilter.value)
  }

  if (statusFilter.value === 'all') return users.value
  if (statusFilter.value === 'active') {
    return users.value.filter((item) => !item.isDeleted && String(item.status || '') !== 'disabled')
  }
  return users.value.filter((item) => item.isDeleted || String(item.status || '') === 'disabled')
})

/** 格式化角色文案。 */
const formatRoleText = (role = '') => {
  if (role === 'super-admin') return '超级管理员'
  if (role === 'admin') return '管理员'
  return '普通用户'
}

/** 根据角色返回标签样式类型。 */
const formatRoleTagType = (role = '') => {
  if (role === 'super-admin') return 'error'
  if (role === 'admin') return 'primary'
  return 'info'
}

/** 切换筛选项。 */
const setActiveFilter = (value) => {
  if (isSuperAdmin.value) {
    roleFilter.value = value
    return
  }
  statusFilter.value = value
}

/** 拉取用户列表（分页拉全量），用于角色配置。 */
const refreshUsers = async () => {
  try {
    const list = []
    let page = 1
    const pageSize = 50
    let total = 0

    do {
      const data = unwrapApiData(
        await fetchAdminUsers({
          page,
          pageSize,
          keyword: keyword.value.trim()
        }),
        { list: [], total: 0 }
      )

      const current = Array.isArray(data.list) ? data.list : []
      total = Number(data.total || 0)
      list.push(...current)
      if (current.length < pageSize) {
        break
      }
      page += 1
    } while (list.length < total)

    users.value = list.filter((item) => {
      if (isSuperAdmin.value) return true
      if (isAdmin.value) return item.role !== 'super-admin'
      return false
    })
  } catch (error) {
    users.value = []
    showErrorToast(resolveApiErrorMessage(error, '用户列表加载失败，请稍后重试'))
  }
}

/** 一键设置或回收管理员角色。 */
const setRole = async (item, targetRole) => {
  if (!isSuperAdmin.value) {
    showErrorToast('仅 super-admin 可设置管理员')
    return
  }
  if (!item?._id) {
    showErrorToast('缺少目标用户信息')
    return
  }

  const actionText = targetRole === 'admin' ? '设为管理员' : '回收管理员'
  uni.showModal({
    title: '确认操作',
    content: `确认将 ${item.realName || '该用户'} ${actionText}吗？`,
    success: async (res) => {
      if (!res.confirm) return

      try {
        submittingId.value = item._id
        unwrapApiData(
          await setUserRole({
            targetUserId: item._id,
            targetRole
          }),
          {}
        )
        showSuccessToast(`${actionText}成功`)
        await refreshUsers()
      } catch (error) {
        showErrorToast(resolveApiErrorMessage(error, `${actionText}失败，请稍后重试`))
      } finally {
        submittingId.value = ''
      }
    }
  })
}

/** admin 逻辑禁用用户账号。 */
const disableTargetUser = async (item) => {
  if (!isAdmin.value) {
    showErrorToast('仅 admin 可禁用用户')
    return
  }
  if (!item?._id) {
    showErrorToast('缺少目标用户信息')
    return
  }

  uni.showModal({
    title: '确认禁用',
    content: `确认禁用 ${item.realName || '该用户'} 吗？禁用后该账号将无法登录。`,
    success: async (res) => {
      if (!res.confirm) return

      try {
        submittingId.value = item._id
        unwrapApiData(
          await disableUser({
            targetUserId: item._id,
            reason: '管理员手动禁用'
          }),
          {}
        )
        showSuccessToast('禁用成功')
        await refreshUsers()
      } catch (error) {
        showErrorToast(resolveApiErrorMessage(error, '禁用失败，请稍后重试'))
      } finally {
        submittingId.value = ''
      }
    }
  })
}

onShow(() => {
  uni.hideTabBar()
  roleFilter.value = 'all'
  statusFilter.value = 'all'
  refreshUsers()
})
</script>

<style scoped>
.page-with-tabbar {
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
}

.section-title {
  font-size: 22px;
  font-weight: 800;
  color: #333333;
  margin: 20px 0 10px;
}

.helper-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.7;
}

.search-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  margin: 14px 0;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.filter-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  margin: 0 0 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.filter-chip--active {
  border-color: #c2410c;
  background: #fff7ed;
}

.filter-chip-text {
  font-size: 13px;
  color: #334155;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.user-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.user-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-name {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.user-meta {
  font-size: 13px;
  color: #64748b;
}

.action-row {
  display: flex;
  justify-content: flex-end;
}

.fixed-text {
  font-size: 13px;
  color: #94a3b8;
}

.empty-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px 16px;
  margin-top: 12px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
}
</style>
