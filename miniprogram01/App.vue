<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onLaunch(() => {
  userStore.initFromStorage()
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import 'uview-plus/index.scss';

page {
  font-size: 16px;
  color: #1f2937;
  background-color: #f7f8fa;
}

.page {
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 8px 0 12px;
}
</style>
