<template>
  <view class="page">
    <u-tabs :list="tabs" :current="current" @change="onTabChange" />

    <u-list>
      <u-cell
        v-for="item in filtered"
        :key="item.id"
        :title="item.title"
        :label="item.desc"
        isLink
        @click="goDetail(item)"
      >
        <template #right-icon>
          <u-tag :text="item.statusText" size="mini" :type="item.tagType" />
        </template>
      </u-cell>
    </u-list>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'

const tabs = [
  { name: '待审核志愿服务' },
  { name: '待审核荣誉获奖' },
  { name: '已审核' },
  { name: '已驳回' }
]

const current = ref(0)

const records = ref([
  {
    id: '1',
    type: 'volunteer',
    title: '红色宣讲活动',
    desc: '申报积分 8 | 2026-03-20',
    status: 'pending'
  },
  {
    id: '2',
    type: 'honor',
    title: '省部级荣誉',
    desc: '申报积分 16 | 2026-03-18',
    status: 'pending'
  },
  {
    id: '3',
    type: 'volunteer',
    title: '社区义诊',
    desc: '审核通过 5 | 2026-03-10',
    status: 'approved'
  },
  {
    id: '4',
    type: 'honor',
    title: '厅局级荣誉',
    desc: '驳回 | 2026-03-05',
    status: 'rejected'
  }
])

const statusMap = {
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '已审核', type: 'success' },
  rejected: { text: '已驳回', type: 'error' }
}

const filtered = computed(() => {
  if (current.value === 0) {
    return records.value
      .filter((item) => item.type === 'volunteer' && item.status === 'pending')
      .map((item) => ({
        ...item,
        statusText: statusMap[item.status].text,
        tagType: statusMap[item.status].type
      }))
  }
  if (current.value === 1) {
    return records.value
      .filter((item) => item.type === 'honor' && item.status === 'pending')
      .map((item) => ({
        ...item,
        statusText: statusMap[item.status].text,
        tagType: statusMap[item.status].type
      }))
  }
  if (current.value === 2) {
    return records.value
      .filter((item) => item.status === 'approved')
      .map((item) => ({
        ...item,
        statusText: statusMap[item.status].text,
        tagType: statusMap[item.status].type
      }))
  }
  return records.value
    .filter((item) => item.status === 'rejected')
    .map((item) => ({
      ...item,
      statusText: statusMap[item.status].text,
      tagType: statusMap[item.status].type
    }))
})

const onTabChange = (index) => {
  current.value = index
}

const goDetail = (item) => {
  uni.navigateTo({ url: `/pages/admin/admin-audit-detail?id=${item.id}` })
}
</script>

<style scoped>
</style>
