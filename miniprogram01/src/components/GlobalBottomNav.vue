<template>
  <view class="bottom-nav" :class="{ 'bottom-nav--fixed': fixed }">
    <view
      v-if="showBack"
      class="bottom-nav__item"
      @click="goBack"
    >
      <u-icon name="arrow-left" size="24" color="#64748b" />
      <text class="bottom-nav__text">返回</text>
    </view>

    <view
      v-for="item in navItems"
      :key="item.pagePath"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': current === item.key }"
      @click="switchPage(item)"
    >
      <u-icon
        :name="item.icon"
        size="24"
        :color="current === item.key ? activeColor : inactiveColor"
      />
      <text class="bottom-nav__text" :class="{ 'bottom-nav__text--active': current === item.key }">
        {{ item.text }}
      </text>
    </view>
  </view>
</template>

<script setup>
/** 全局底部导航，只保留首页和我的两个固定入口。 */

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

const activeColor = '#c2410c'
const inactiveColor = '#8c8c8c'

const navItems = [
  { key: 'index', text: '首页', pagePath: '/pages/index/index', icon: 'home' },
  { key: 'mine', text: '我的', pagePath: '/pages/mine/mine', icon: 'account' }
]

/** 返回上一页；若当前没有可回退页面，则兜底回到首页。 */
const goBack = () => {
  const pages = getCurrentPages()

  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.reLaunch({ url: '/pages/index/index' })
}

/** 从任意页面切换到首页或我的，优先使用原生 TabBar 提升切换速度。 */
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
  min-height: 68px;
  padding: 8px 8px calc(10px + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.bottom-nav__text {
  font-size: 13px;
  color: #8c8c8c;
}

.bottom-nav__text--active {
  color: #c2410c;
  font-weight: 700;
}
</style>
