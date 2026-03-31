/** 统一轻提示，保持页面反馈文案和展示方式一致。 */
export const showInfoToast = (title) =>
  uni.showToast({
    title,
    icon: 'none',
    duration: 2200
  })

/** 统一错误提示。 */
export const showErrorToast = (title) => showInfoToast(title)

/** 统一成功提示。 */
export const showSuccessToast = (title) => showInfoToast(title)
