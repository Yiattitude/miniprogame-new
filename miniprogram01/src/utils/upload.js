import { showErrorToast } from '@/utils/feedback'

const MAX_FILE_SIZE = 10 * 1024 * 1024

/** 上传前说明用途，符合“先说明、后申请”的微信合规要求。 */
export const confirmMediaPermission = (sourceType) =>
  new Promise((resolve) => {
    const sourceLabel = sourceType === 'camera' ? '相机' : '相册'
    uni.showModal({
      title: '权限申请说明',
      content: `需要使用您的${sourceLabel}上传佐证材料，仅在您主动提交申报时使用。是否继续？`,
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false)
    })
  })

/** 打开微信系统权限设置页，便于用户重新授权。 */
export const openSystemPermissionSetting = () =>
  new Promise((resolve) => {
    if (typeof uni.openSetting !== 'function') {
      showErrorToast('当前环境暂不支持打开权限设置')
      resolve(false)
      return
    }

    uni.openSetting({
      success: (res) => resolve(res),
      fail: () => resolve(false)
    })
  })

/** 判断是否属于用户取消选择，取消不应被视为权限拒绝。 */
const isCancelError = (message = '') => /cancel/i.test(message)

/** 判断是否属于权限被拒绝，便于给出打开设置的引导。 */
const isPermissionDeniedError = (message = '') => /auth deny|authorize|permission|denied/i.test(message)

/** 统一调起图片选择，并过滤超出 10MB 的图片。 */
export const chooseEvidenceImages = async ({ sourceType = 'album', count = 1, maxSize = MAX_FILE_SIZE } = {}) => {
  const confirmed = await confirmMediaPermission(sourceType)
  if (!confirmed) {
    return { files: [], status: 'cancelled' }
  }

  try {
    const res = await new Promise((resolve, reject) => {
      uni.chooseMedia({
        count,
        mediaType: ['image'],
        sourceType: [sourceType],
        sizeType: ['compressed'],
        camera: sourceType === 'camera' ? 'back' : undefined,
        success: resolve,
        fail: reject
      })
    })

    const validFiles = (res?.tempFiles || [])
      .filter((item) => item.size <= maxSize)
      .map((item, index) => ({
        url: item.tempFilePath,
        name: item.tempFilePath?.split('/').pop() || `evidence-${Date.now()}-${index + 1}.jpg`,
        size: item.size,
        type: 'image',
        sourceType
      }))

    if (validFiles.length !== (res?.tempFiles || []).length) {
      showErrorToast('超出10MB的图片已自动过滤')
    }

    return {
      files: validFiles,
      status: 'granted'
    }
  } catch (error) {
    const message = error?.errMsg || ''

    if (isCancelError(message)) {
      return { files: [], status: 'cancelled' }
    }

    if (isPermissionDeniedError(message)) {
      uni.showModal({
        title: '权限未开启',
        content: '未获得所需权限，是否前往系统设置重新开启？',
        success: async (res) => {
          if (res.confirm) {
            await openSystemPermissionSetting()
          }
        }
      })
      return { files: [], status: 'denied' }
    }

    showErrorToast('选择图片失败，请重试')
    return { files: [], status: 'failed' }
  }
}

/** 前端仅做流程占位，真正的文本与图片安全校验由后端接入微信接口完成。 */
export const checkContentSecurity = async (payload = {}) => {
  const hasText = Object.values(payload?.text || {}).some((item) => `${item || ''}`.trim())
  const hasFiles = Array.isArray(payload?.files) && payload.files.length > 0

  if (!hasText && !hasFiles) {
    return false
  }

  uni.showLoading({ title: '内容校验中', mask: true })
  uni.hideLoading()
  return true
}

/** 页面展示用的权限状态文案。 */
export const getPermissionStatusLabel = (status) => {
  const mapping = {
    unknown: '未申请',
    granted: '已允许',
    denied: '已拒绝',
    failed: '申请失败'
  }
  return mapping[status] || '未申请'
}
