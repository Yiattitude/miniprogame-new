<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { ensureComplianceReady, setupComplianceInterceptors } from '@/utils/auth'

const userStore = useUserStore()

/** 应用启动时恢复本地状态，并注册统一的合规路由守卫。 */
onLaunch(() => {
  userStore.initFromStorage()
  setupComplianceInterceptors(userStore)
  if (!userStore.privacyAgreed || !userStore.hasRealname) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }
  console.log('App Launch')
})

/** 应用回到前台时再次校验，避免退出登录后仍停留在业务页。 */
onShow(() => {
  ensureComplianceReady(userStore, { redirect: true, toast: false })
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import 'uview-plus/index.scss';

page {
  --app-bg: #f8fafc;
  --app-card-bg: #ffffff;
  --app-text-primary: #0f172a;
  --app-text-secondary: #334155;
  --app-text-muted: #475569;
  --app-text-light: #64748b;
  --app-border: #cbd5e1;
  --app-accent: #c2410c;
  --app-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  font-size: 17px;
  line-height: 1.7;
  color: var(--app-text-primary);
  background-color: var(--app-bg);
}

.page {
  min-height: 100vh;
  padding: 18px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-with-nav {
  padding-bottom: calc(110px + env(safe-area-inset-bottom));
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  margin: 10px 0 14px;
  color: var(--app-text-primary);
}

.card-panel,
.form-panel,
.summary-card,
.preview-card,
.notice-card,
.toolbar-card,
.card,
.record-card,
.entry-card,
.log-card,
.points-card {
  background: var(--app-card-bg);
  border-radius: 16px;
  padding: 18px;
  box-shadow: var(--app-shadow);
}

.helper-text,
.paragraph,
.hint,
.upload-status,
.preview-desc,
.summary-text {
  font-size: 15px;
  color: var(--app-text-secondary);
  line-height: 1.7;
}

.empty-card {
  background: var(--app-card-bg);
  border-radius: 16px;
  min-height: 132px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: var(--app-shadow);
}

.empty-text {
  font-size: 16px;
  color: var(--app-text-muted);
  line-height: 1.7;
}

.u-form-item__body__left__content__label {
  font-size: 17px !important;
  font-weight: 700 !important;
  color: var(--app-text-primary) !important;
}

.u-input,
.u-textarea {
  border-radius: 12px !important;
}

.u-input__content,
.u-textarea {
  background: var(--app-card-bg) !important;
  border: 1px solid var(--app-border) !important;
}

.u-textarea__field {
  line-height: 1.7 !important;
  color: var(--app-text-primary) !important;
}

.u-input__content {
  min-height: 52px;
  padding: 0 12px;
  box-sizing: border-box;
}

.u-textarea {
  padding: 10px 12px !important;
  box-sizing: border-box;
}

button,
.u-button {
  min-height: 52px;
  border-radius: 14px !important;
  font-size: 17px !important;
  font-weight: 700 !important;
}

input,
textarea,
.u-input__content__field-wrapper__field {
  font-size: 16px;
  color: var(--app-text-primary);
}

.action-group,
.action-row,
.detail-actions,
.batch-actions,
.upload-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.u-cell-group {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--app-shadow);
}

.u-cell__body {
  min-height: 60px;
  padding: 16px 16px !important;
}

.u-cell__title-text {
  font-size: 17px !important;
  line-height: 1.6 !important;
  font-weight: 700 !important;
  color: var(--app-text-primary) !important;
}

.u-cell__label {
  margin-top: 6px !important;
  font-size: 14px !important;
  line-height: 1.7 !important;
  color: var(--app-text-muted) !important;
}

.u-cell__value {
  font-size: 15px !important;
  color: var(--app-text-secondary) !important;
}

.u-tabs__wrapper__nav__item {
  min-height: 48px;
  padding: 0 6px;
}

.u-tabs__wrapper__nav__item__text {
  font-size: 16px !important;
  line-height: 1.5 !important;
  font-weight: 700 !important;
}

.u-tabs__wrapper__nav__line {
  height: 4px !important;
  border-radius: 999px;
}

.u-tag {
  min-height: 28px;
  padding: 0 8px;
}

/* 隐藏原生 tabBar，使用自定义组件 GlobalBottomNav 替代。 */
uni-tabbar,
.uni-tabbar {
  display: none !important;
}
</style>
