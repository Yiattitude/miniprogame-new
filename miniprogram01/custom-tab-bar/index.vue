<template>
  <view class="tabbar">
    <view
      v-for="(item, index) in tabs"
      :key="item.pagePath"
      class="tabbar-item"
      @click="switchTab(item, index)"
    >
      <u-icon
        :name="item.icon"
        size="22"
        :color="selected === index ? activeColor : inactiveColor"
      />
      <text class="tabbar-text" :class="{ active: selected === index }">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const selected = ref(0)

const activeColor = '#1677ff'
const inactiveColor = '#8c8c8c'

const allTabs = [
  { text: '首页', pagePath: '/pages/home/home', icon: 'home' },
  { text: '我的', pagePath: '/pages/my/my-page', icon: 'account' },
  { text: '管理后台', pagePath: '/pages/admin/admin-home', icon: 'setting' }
]

const tabs = computed(() => (userStore.isAdmin ? allTabs : allTabs.slice(0, 2)))

const setData = (data) => {
  if (typeof data.selected === 'number') {
    selected.value = data.selected
  }
}

const switchTab = (item, index) => {
  selected.value = index
  uni.switchTab({ url: item.pagePath })
}

defineExpose({ setData })
</script>

<style scoped>
.tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
  background: #ffffff;
  border-top: 1px solid #e6e8ec;
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tabbar-text {
  font-size: 12px;
  color: #8c8c8c;
}

.tabbar-text.active {
  color: #1677ff;
  font-weight: 600;
}
</style>
