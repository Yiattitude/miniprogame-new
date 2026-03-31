import { showErrorToast } from '@/utils/feedback'

const CLOUD_ENV_ID = String(import.meta.env.VITE_CLOUD_ENV_ID || '').trim()
const MAX_FILE_SIZE = 50 * 1024 * 1024
const ALLOWED_FILE_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt', 'csv']

let wxCloudInitialized = false

/** 读取本地缓存中的 openid，用于拼接更稳定的云存储路径。 */
const resolveOpenid = () => {
  const directOpenid = uni.getStorageSync('yc_openid')
  if (directOpenid) return String(directOpenid).trim()

  const userState = uni.getStorageSync('yc_user_state')
  if (userState && typeof userState === 'object' && userState.openid) {
    return String(userState.openid).trim()
  }

  return 'anonymous'
}

/** 仅在小程序环境初始化一次 wx.cloud。 */
const ensureWxCloudReady = () => {
  if (wxCloudInitialized) return true
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.init !== 'function') return false

  try {
    const initConfig = CLOUD_ENV_ID ? { env: CLOUD_ENV_ID, traceUser: true } : { traceUser: true }
    wx.cloud.init(initConfig)
    wxCloudInitialized = true
    return true
  } catch (error) {
    console.warn('[upload] wx.cloud.init failed:', error)
    return false
  }
}

/** 判断当前引用是否为云文件 ID。 */
export const isCloudFileId = (value = '') => /^cloud:\/\//i.test(String(value || '').trim())

/** 判断当前引用是否为可直接访问的 HTTP 地址。 */
export const isHttpUrl = (value = '') => /^https?:\/\//i.test(String(value || '').trim())

/** 判断当前引用是否为本地临时文件路径。 */
export const isLocalFilePath = (value = '') =>
  /^(wxfile|http:\/\/tmp|https:\/\/tmp|\/|[a-zA-Z]:[\\/])/.test(String(value || '').trim())

/** 从文件引用中提取展示文件名。 */
export const resolveFileName = (fileRef = '') => {
  const normalized = String(fileRef || '').split('?')[0]
  const segments = normalized.split(/[\\/]/).filter(Boolean)
  return segments[segments.length - 1] || '未命名文件'
}

/** 根据文件名后缀判断是否为图片。 */
export const isImageFile = (fileRef = '') =>
  /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(resolveFileName(fileRef))

/** 根据文件名推断 openDocument 所需的文件类型。 */
export const resolveDocumentFileType = (fileRef = '') => {
  const match = resolveFileName(fileRef).match(/\.([^.]+)$/)
  return match ? String(match[1] || '').trim().toLowerCase() : ''
}

/** 统一封装云端上传，成功后返回 fileID。 */
export const uploadLocalFileToCloud = ({ filePath, fileName = '', folder = 'uploads' } = {}) =>
  new Promise((resolve, reject) => {
    const safeFilePath = String(filePath || '').trim()
    if (!safeFilePath) {
      reject(new Error('缺少待上传文件路径'))
      return
    }

    const originName = resolveFileName(fileName || safeFilePath)
    const extMatch = originName.match(/(\.[^.]+)$/)
    const ext = extMatch ? extMatch[1] : ''
    const cloudPath = `${String(folder || 'uploads').replace(/^\/+|\/+$/g, '')}/${resolveOpenid()}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`

    if (ensureWxCloudReady() && wx?.cloud?.uploadFile) {
      wx.cloud.uploadFile({
        cloudPath,
        filePath: safeFilePath,
        success: (res) => {
          resolve({
            fileID: res.fileID,
            cloudPath,
            fileName: originName
          })
        },
        fail: (error) => reject(error || new Error('云端上传失败'))
      })
      return
    }

    if (typeof uniCloud !== 'undefined' && uniCloud?.uploadFile) {
      uniCloud.uploadFile({
        cloudPath,
        filePath: safeFilePath,
        success: (res) => {
          resolve({
            fileID: res.fileID || res.tempFileURL || '',
            cloudPath,
            fileName: originName
          })
        },
        fail: (error) => reject(error || new Error('云端上传失败'))
      })
      return
    }

    reject(new Error('当前环境未启用云文件上传能力'))
  })

/** 将云文件 ID 转换为临时可访问地址。 */
export const getCloudTempUrl = (fileID = '') =>
  new Promise((resolve, reject) => {
    const safeFileID = String(fileID || '').trim()
    if (!safeFileID) {
      reject(new Error('缺少云文件标识'))
      return
    }

    if (ensureWxCloudReady() && wx?.cloud?.getTempFileURL) {
      wx.cloud.getTempFileURL({
        fileList: [safeFileID],
        success: (res) => {
          const item = Array.isArray(res.fileList) ? res.fileList[0] : null
          if (item?.tempFileURL) {
            resolve(item.tempFileURL)
            return
          }
          reject(new Error(item?.errMsg || '获取文件地址失败'))
        },
        fail: (error) => reject(error || new Error('获取文件地址失败'))
      })
      return
    }

    reject(new Error('当前环境未启用云文件读取能力'))
  })

/** 将任意文件引用解析为可访问地址。 */
export const resolveFileAccessUrl = async (fileRef = '') => {
  const safeFileRef = String(fileRef || '').trim()
  if (!safeFileRef) {
    throw new Error('缺少文件地址')
  }

  if (isHttpUrl(safeFileRef) || isLocalFilePath(safeFileRef)) {
    return safeFileRef
  }

  if (isCloudFileId(safeFileRef)) {
    return getCloudTempUrl(safeFileRef)
  }

  return safeFileRef
}

/** 下载远程文件到本地临时目录。 */
export const downloadRemoteFile = (url = '') =>
  new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && res.tempFilePath) {
          resolve(res.tempFilePath)
          return
        }
        reject(new Error('文件下载失败'))
      },
      fail: (error) => reject(error || new Error('文件下载失败'))
    })
  })

/** 将临时文件持久化保存到小程序本地文件目录。 */
export const saveLocalFile = (tempFilePath = '') =>
  new Promise((resolve, reject) => {
    const safeTempFilePath = String(tempFilePath || '').trim()
    if (!safeTempFilePath) {
      reject(new Error('缺少待保存文件'))
      return
    }

    if (typeof uni.saveFile !== 'function') {
      resolve(safeTempFilePath)
      return
    }

    uni.saveFile({
      tempFilePath: safeTempFilePath,
      success: (res) => resolve(res.savedFilePath || safeTempFilePath),
      fail: (error) => reject(error || new Error('文件保存失败'))
    })
  })

/** 打开云文件或普通文件，图片走预览，文档走下载后打开。 */
export const previewCloudFile = async (fileRef = '', options = {}) => {
  const safeFileRef = String(fileRef || '').trim()
  if (!safeFileRef) {
    showErrorToast('缺少文件地址')
    return false
  }

  try {
    const accessUrl = await resolveFileAccessUrl(safeFileRef)
    const imageLike = typeof options.isImage === 'boolean' ? options.isImage : isImageFile(options.fileName || safeFileRef)

    if (imageLike) {
      uni.previewImage({
        current: accessUrl,
        urls: [accessUrl]
      })
      return true
    }

    const downloadedFilePath = isLocalFilePath(accessUrl) ? accessUrl : await downloadRemoteFile(accessUrl)
    const localFilePath = await saveLocalFile(downloadedFilePath)
    const fileType = String(options.fileType || resolveDocumentFileType(options.fileName || safeFileRef)).trim()
    await new Promise((resolve, reject) => {
      uni.openDocument({
        filePath: localFilePath,
        fileType,
        showMenu: true,
        success: () => resolve(true),
        fail: (error) => reject(error || new Error('文件打开失败'))
      })
    })
    return true
  } catch (error) {
    showErrorToast(error?.message || '文件打开失败，请稍后重试')
    return false
  }
}

/** 上传前先说明用途，符合微信“先说明、后申请”的合规要求。 */
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

/** 上传文件前说明用途，避免页面加载时提前申请能力。 */
export const confirmFilePermission = () =>
  new Promise((resolve) => {
    uni.showModal({
      title: '权限申请说明',
      content: '需要读取您选择的文件上传佐证材料，仅在您主动提交申报时使用。是否继续？',
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false)
    })
  })

/** 打开系统权限设置页，便于用户重新授权。 */
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

/** 判断是否为用户主动取消。 */
const isCancelError = (message = '') => /cancel/i.test(String(message || ''))

/** 判断是否为权限拒绝。 */
const isPermissionDeniedError = (message = '') => /auth deny|authorize|permission|denied/i.test(String(message || ''))

/** 过滤超出大小限制的文件。 */
const filterByMaxSize = (files = [], maxSize = MAX_FILE_SIZE) => {
  const accepted = []
  const rejected = []

  files.forEach((item) => {
    if (Number(item.size || 0) > maxSize) {
      rejected.push(item)
      return
    }
    accepted.push(item)
  })

  return { accepted, rejected }
}

/** 逐个上传附件到云存储，确保提交给后端的是稳定 fileID。 */
const uploadEvidenceBatch = async (files = [], folder = 'evidence') => {
  const uploadedFiles = []

  for (const item of files) {
    const localPath = item.tempFilePath || item.path || item.url || ''
    const fileName = item.name || localPath.split('/').pop() || `file-${Date.now()}`
    const uploadRes = await uploadLocalFileToCloud({
      filePath: localPath,
      fileName,
      folder
    })

    uploadedFiles.push({
      fileID: uploadRes.fileID,
      url: localPath,
      name: fileName,
      size: Number(item.size || 0),
      type: item.type || 'file',
      mimeType: item.mimeType || item.type || ''
    })
  }

  return uploadedFiles
}

/** 统一选择图片并立即上传到云存储。 */
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

    const selectedFiles = (res?.tempFiles || []).map((item, index) => ({
      tempFilePath: item.tempFilePath,
      name: item.tempFilePath?.split('/').pop() || `evidence-${Date.now()}-${index + 1}.jpg`,
      size: Number(item.size || 0),
      type: 'image',
      mimeType: 'image/*'
    }))
    const { accepted, rejected } = filterByMaxSize(selectedFiles, maxSize)

    if (rejected.length > 0) {
      showErrorToast(`有 ${rejected.length} 张图片超过 50MB，已自动过滤`)
    }

    if (accepted.length === 0) {
      return { files: [], status: 'failed' }
    }

    uni.showLoading({ title: '上传中', mask: true })
    const uploadedFiles = await uploadEvidenceBatch(accepted, 'evidence/images')
    uni.hideLoading()

    return {
      files: uploadedFiles,
      status: 'granted'
    }
  } catch (error) {
    uni.hideLoading()
    const message = error?.errMsg || error?.message || ''

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

    showErrorToast('图片上传失败，请稍后重试')
    return { files: [], status: 'failed' }
  }
}

/** 统一选择普通文件并立即上传到云存储。 */
export const chooseEvidenceFiles = async ({ count = 1, maxSize = MAX_FILE_SIZE } = {}) => {
  const confirmed = await confirmFilePermission()
  if (!confirmed) {
    return { files: [], status: 'cancelled' }
  }

  try {
    const res = await new Promise((resolve, reject) => {
      uni.chooseMessageFile({
        count,
        type: 'file',
        extension: ALLOWED_FILE_EXTENSIONS,
        success: resolve,
        fail: reject
      })
    })

    const selectedFiles = (res?.tempFiles || []).map((item) => ({
      path: item.path || item.tempFilePath || '',
      tempFilePath: item.path || item.tempFilePath || '',
      name: item.name || '未命名文件',
      size: Number(item.size || 0),
      type: 'file',
      mimeType: item.type || ''
    }))
    const { accepted, rejected } = filterByMaxSize(selectedFiles, maxSize)

    if (rejected.length > 0) {
      showErrorToast(`有 ${rejected.length} 个文件超过 50MB，已自动过滤`)
    }

    if (accepted.length === 0) {
      return { files: [], status: 'failed' }
    }

    uni.showLoading({ title: '上传中', mask: true })
    const uploadedFiles = await uploadEvidenceBatch(accepted, 'evidence/files')
    uni.hideLoading()

    return {
      files: uploadedFiles,
      status: 'granted'
    }
  } catch (error) {
    uni.hideLoading()
    const message = error?.errMsg || error?.message || ''

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

    showErrorToast('文件上传失败，请稍后重试')
    return { files: [], status: 'failed' }
  }
}

/** 前端仅做流程占位，真正的文本与图片内容安全校验由后端接入微信接口完成。 */
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
