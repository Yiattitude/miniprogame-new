<template>
  <view class="bottom-nav" :class="{ 'bottom-nav--fixed': fixed }">
    <view v-if="showBack" class="bottom-nav__item" @click="goBack">
      <uni-icons type="left" size="20" color="#64748b" />
      <text class="bottom-nav__text">返回</text>
    </view>

    <view
      v-for="item in navItems"
      :key="item.key"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': current === item.key }"
      @click="switchPage(item)"
    >
      <image
        :src="current === item.key ? item.activeIcon : item.icon"
        class="bottom-nav__icon"
        mode="widthFix"
      />
      <text class="bottom-nav__text" :class="{ 'bottom-nav__text--active': current === item.key }">
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import { useUserStore } from '@/store'

/** 全局底部导航，支持根据管理员权限动态扩展。 */

const props = defineProps({
  current: {
    type: String,
    default: 'index'
  },
  showBack: {
    type: Boolean,
    default: true
  },
  fixed: {
    type: Boolean,
    default: true
  }
})

const userStore = useUserStore()

const navItems = computed(() => {
  const items = [
    {
      key: 'index',
      text: '首页',
      pagePath: '/pages/index/index',
      icon: '/static/tabbar/home.png',
      activeIcon: '/static/tabbar/home-active.png'
    },
    {
      key: 'mine',
      text: '我的',
      pagePath: '/pages/mine/mine',
      icon: '/static/tabbar/mine.png',
      activeIcon: '/static/tabbar/mine-active.png'
    }
  ]
  if (userStore.isAdmin) {
    items.push({
      key: 'admin',
      text: '管理',
      pagePath: '/pages/admin/index',
      icon: '/static/tabbar/admin.png',
      activeIcon: '/static/tabbar/admin-active.png'
    })
  }
  return items
})

/** 返回上一页；若当前没有可回退页面，则兜底回到首页。 */
const goBack = () => {
  const pages = getCurrentPages()

  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.reLaunch({ url: '/pages/index/index' })
}

/** 切换到对应的核心页面。 */
const switchPage = (item) => {
  if (props.current === item.key) return
  uni.switchTab({ url: item.pagePath })
}
</script>

<style scoped>
.bottom-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  min-height: 76px;
  padding: 10px 10px calc(12px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.94);
  border-top: 1px solid rgba(198, 215, 232, 0.72);
  box-shadow: 0 -10px 24px rgba(19, 58, 107, 0.08);
  box-sizing: border-box;
}

.bottom-nav--fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
}

.bottom-nav__item {
  flex: 1;
  min-height: 52px;
  margin: 0 4px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.bottom-nav__item--active {
  background: linear-gradient(135deg, rgba(29, 99, 216, 0.14), rgba(21, 164, 144, 0.14));
}

.bottom-nav__icon {
  width: 26px;
  height: 26px;
  display: block;
}

.bottom-nav__text {
  font-size: 13px;
  color: #6f869a;
}

.bottom-nav__text--active {
  color: #1648a5;
  font-weight: 700;
}
</style>
