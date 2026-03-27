<template>
  <view class="page">
    <view class="filter-row">
      <u-input
        v-model="selectedYear"
        readonly
        placeholder="选择年度"
        @click="showYearPicker = true"
      />
    </view>

    <u-list>
      <u-cell
        v-for="record in records"
        :key="record.id"
        :title="record.title"
        :label="`审核积分：${record.points} 分`"
        isLink
        @click="goDetail(record)"
      />
    </u-list>

    <u-picker
      :show="showYearPicker"
      :columns="[yearOptions]"
      @confirm="onYearConfirm"
      @cancel="showYearPicker = false"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, idx) => String(currentYear - idx))

const showYearPicker = ref(false)
const selectedYear = ref(String(currentYear))

const records = ref([
  {
    id: '1',
    title: '社区义诊志愿服务',
    points: 5
  },
  {
    id: '2',
    title: '红色宣讲活动',
    points: 8
  }
])

const onYearConfirm = (value) => {
  selectedYear.value = value?.value?.[0] || selectedYear.value
  showYearPicker.value = false
}

const goDetail = (record) => {
  uni.navigateTo({ url: `/pages/volunteer-service/volunteer-record-detail?id=${record.id}` })
}
</script>

<style scoped>
.filter-row {
  margin-bottom: 16px;
}
</style>
