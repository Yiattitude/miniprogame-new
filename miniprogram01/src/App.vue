<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { ensureComplianceReady, setupComplianceInterceptors } from '@/utils/auth'
import '@/utils/api-helper'

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
@import '@/styles/theme.scss';

page {
  --app-bg: #f5f9ff;
  --app-bg-soft: #eef6fb;
  --app-card-bg: #ffffff;
  --app-card-alt: #f8fbff;
  --app-text-primary: #12304e;
  --app-text-secondary: #35516f;
  --app-text-muted: #5f7992;
  --app-text-light: #7f95a9;
  --app-border: #c6d7e8;
  --app-border-soft: #dbe7f2;
  --app-primary: #1d63d8;
  --app-primary-deep: #1648a5;
  --app-secondary: #15a490;
  --app-accent: #e3a63a;
  --app-danger: #c85b51;
  --app-success: #0f9c7e;
  --app-fill-soft: #eef5ff;
  --app-fill-brand: linear-gradient(135deg, #1d63d8 0%, #177ddc 48%, #15a490 100%);
  --app-fill-honor: linear-gradient(135deg, #1d63d8 0%, #327de0 42%, #e3a63a 100%);
  --app-shadow: 0 18px 34px rgba(19, 58, 107, 0.08);
  --app-shadow-strong: 0 22px 40px rgba(25, 88, 181, 0.16);
  font-size: 17px;
  line-height: 1.7;
  color: var(--app-text-primary);
  background: var(--app-bg);
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
  border-radius: 24px;
  padding: 18px;
  border: 1px solid rgba(172, 199, 231, 0.42);
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
  border-radius: 24px;
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
  background: #f9fbff !important;
  border: 1px solid var(--app-border-soft) !important;
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
  border-radius: 16px !important;
  font-size: 17px !important;
  font-weight: 700 !important;
}

.u-button--primary {
  background: linear-gradient(135deg, #1d63d8 0%, #177ddc 48%, #15a490 100%) !important;
  border: none !important;
  box-shadow: 0 14px 26px rgba(29, 99, 216, 0.18) !important;
}

.u-button--info {
  color: var(--app-primary-deep) !important;
  border-color: rgba(29, 99, 216, 0.22) !important;
  background: rgba(244, 249, 255, 0.92) !important;
}

.u-button--error {
  background: linear-gradient(135deg, #c85b51 0%, #de7b69 100%) !important;
  border: none !important;
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
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(172, 199, 231, 0.42);
  box-shadow: var(--app-shadow);
}

.u-cell__body {
  min-height: 64px;
  padding: 18px 16px !important;
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
  background: linear-gradient(90deg, #1d63d8, #15a490) !important;
}

.u-tag {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px !important;
}

.u-search {
  border-radius: 18px !important;
}

.u-search__content {
  min-height: 50px !important;
  border-radius: 16px !important;
  background: #f9fbff !important;
  border: 1px solid rgba(198, 215, 232, 0.72) !important;
  padding: 0 14px !important;
  box-sizing: border-box;
}

.u-search__content__input {
  font-size: 16px !important;
  color: var(--app-text-primary) !important;
}

.u-search__content__icon {
  color: var(--app-text-light) !important;
}

.u-picker__view,
.u-datetime-picker__view {
  border-radius: 24px 24px 0 0 !important;
  overflow: hidden;
}

.u-picker__view__toolbar,
.u-datetime-picker__header {
  min-height: 56px !important;
  background: #f8fbff !important;
  border-bottom: 1px solid rgba(198, 215, 232, 0.56) !important;
}

.u-picker__view__toolbar__button,
.u-datetime-picker__header__btn {
  font-size: 16px !important;
  font-weight: 700 !important;
  color: var(--app-primary-deep) !important;
}

.u-picker__view__toolbar__title,
.u-datetime-picker__header__title {
  font-size: 17px !important;
  font-weight: 800 !important;
  color: var(--app-text-primary) !important;
}

.u-picker__view__column__item,
.u-picker-item {
  font-size: 18px !important;
  color: var(--app-text-primary) !important;
}

.u-modal__content {
  padding-top: 6px !important;
}

.u-modal__title {
  font-size: 19px !important;
  font-weight: 800 !important;
  color: var(--app-text-primary) !important;
}

.u-modal__content__text {
  font-size: 15px !important;
  line-height: 1.75 !important;
  color: var(--app-text-secondary) !important;
}

.u-modal__button-group__wrapper {
  min-height: 54px !important;
}

.u-modal__button-group__wrapper__text {
  font-size: 16px !important;
  font-weight: 700 !important;
}

/* 隐藏原生 tabBar，使用自定义组件 GlobalBottomNav 替代。 */
</style>
