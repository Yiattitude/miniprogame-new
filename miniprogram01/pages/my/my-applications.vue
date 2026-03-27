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
  { name: '待审核' },
  { name: '已通过' },
  { name: '已驳回' }
]

const current = ref(0)

const records = ref([
  {
    id: '1',
    title: '红色宣讲活动',
    desc: '志愿服务 | 申报积分 8',
    status: 'pending'
  },
  {
    id: '2',
    title: '国家级荣誉',
    desc: '荣誉获奖 | 20 分',
    status: 'approved'
  },
  {
    id: '3',
    title: '社区义诊',
    desc: '志愿服务 | 申报积分 5',
    status: 'rejected'
  }
])

const statusMap = {
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已驳回', type: 'error' }
}

const filtered = computed(() => {
  const statusKey = ['pending', 'approved', 'rejected'][current.value]
  return records.value
    .filter((item) => item.status === statusKey)
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
  if (item.status === 'rejected') {
    uni.showToast({ title: '该记录已驳回，可进入详情修改重提', icon: 'none' })
  }
}
</script>

<style scoped>
</style>
