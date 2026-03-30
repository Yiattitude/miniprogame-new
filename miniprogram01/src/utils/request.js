const BASE_URL = String(import.meta.env.VITE_BASE_URL || '').trim()
const CLOUD_FUNCTION_NAME = String(import.meta.env.VITE_CLOUD_FUNCTION_NAME || 'volunteer-service').trim()
const CLOUD_ENV_ID = String(import.meta.env.VITE_CLOUD_ENV_ID || '').trim()
const CLOUD_TIMEOUT_MS = Number(import.meta.env.VITE_CLOUD_TIMEOUT_MS || 12000)

/** REST 路由与云函数 action 映射，确保前端统一按 URL 写法调用。 */
const ROUTE_ACTION_MAP = {
  'POST /auth/login': 'wechatLogin',
  'POST /user/realname': 'bindUser',
  'GET /user/profile': 'getUserProfile',
  'POST /volunteer/submit': 'submitVolunteerDeclaration',
  'GET /volunteer/records': 'getVolunteerRecords',
  'POST /honor/submit': 'submitHonor',
  'GET /honor/records': 'getHonorRecords',
  'POST /admin/import': 'adminImport',
  'GET /admin/dashboard': 'adminDashboardSummary',
  'GET /admin/audit': 'adminAuditList',
  'POST /admin/audit': 'adminAuditOperate',
  'GET /admin/export': 'adminExport'
}

let wxCloudInitialized = false

/** 从本地缓存读取 openid，兼容独立缓存和 user_state 两种结构。 */
const resolveOpenid = () => {
  const directOpenid = uni.getStorageSync('yc_openid')
  if (directOpenid) return String(directOpenid).trim()

  const userState = uni.getStorageSync('yc_user_state')
  if (userState && typeof userState === 'object' && userState.openid) {
    return String(userState.openid).trim()
  }

  return ''
}

/** 在请求参数中自动注入 openid，便于云函数识别当前用户。 */
const attachOpenid = (data, openid) => {
  if (!openid) return data

  if (data == null) return { openid }

  if (typeof data !== 'object' || Array.isArray(data)) return data

  if (Object.prototype.hasOwnProperty.call(data, 'openid') || Object.prototype.hasOwnProperty.call(data, '_openid')) {
    return data
  }

  return { ...data, openid }
}

/** 统一规范化路由，兼容 query、重复斜杠和尾斜杠。 */
const normalizeRoutePath = (url = '') => {
  const cleanPath = String(url || '')
    .trim()
    .split('?')[0]
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/')

  if (!cleanPath) return ''
  const normalized = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
  return normalized.endsWith('/') && normalized.length > 1 ? normalized.slice(0, -1) : normalized
}

/** 将 method 标准化为大写，默认 GET。 */
const normalizeMethod = (method = 'GET') => String(method || 'GET').trim().toUpperCase()

/** 判断字符串是否为完整 http(s) 地址。 */
const isHttpUrl = (value = '') => /^https?:\/\//i.test(String(value || '').trim())

/** BASE_URL 可用且为完整 URL 时走 HTTP 请求，否则走云函数。 */
const shouldUseHttp = (url = '') => isHttpUrl(url) || (BASE_URL !== '' && isHttpUrl(BASE_URL))

/** 计算 HTTP 最终请求地址，支持传入完整 URL 或相对路由。 */
const resolveHttpUrl = (url = '') => {
  if (isHttpUrl(url)) return String(url).trim()
  return `${BASE_URL}${url || ''}`
}

/** 将路由 method+path 转为云函数 action。 */
const resolveAction = (method, url) => ROUTE_ACTION_MAP[`${normalizeMethod(method)} ${normalizeRoutePath(url)}`] || ''

/** 统一封装 uni.request。 */
const requestByHttp = (options) =>
  new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res)
          return
        }
        reject(res)
      },
      fail: (error) => reject(error)
    })
  })

/** 初始化微信云开发，仅在 mp-weixin 且存在 wx.cloud 时执行一次。 */
const ensureWxCloudReady = () => {
  if (wxCloudInitialized) return true
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.init !== 'function') return false

  try {
    const initConfig = CLOUD_ENV_ID ? { env: CLOUD_ENV_ID, traceUser: true } : { traceUser: true }
    wx.cloud.init(initConfig)
    wxCloudInitialized = true
    return true
  } catch (error) {
    console.warn('[request] wx.cloud.init failed:', error)
    return false
  }
}

/** 统一封装云函数调用，优先 wx.cloud，兜底 uniCloud。 */
const requestByCloudFunction = ({ url, method, data, header, token }) =>
  new Promise((resolve, reject) => {
    let settled = false
    const timeoutTimer = setTimeout(() => {
      if (settled) return
      settled = true
      reject({ errMsg: '请求超时，请稍后重试' })
    }, Number.isFinite(CLOUD_TIMEOUT_MS) && CLOUD_TIMEOUT_MS > 0 ? CLOUD_TIMEOUT_MS : 12000)

    const action = resolveAction(method, url)
    const path = normalizeRoutePath(url)

    if (!action) {
      clearTimeout(timeoutTimer)
      settled = true
      reject({ errMsg: `未匹配到云函数 action：${normalizeMethod(method)} ${path}` })
      return
    }

    const payload = {
      action,
      method: normalizeMethod(method),
      path,
      route: path,
      data,
      header: {
        ...(header || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }

    const handleSuccess = (res) => {
      if (settled) return
      settled = true
      clearTimeout(timeoutTimer)

      const result = res?.result
      if (result && typeof result === 'object') {
        resolve({ statusCode: 200, data: result })
        return
      }
      resolve({
        statusCode: 200,
        data: {
          code: 500,
          message: '接口返回格式异常'
        }
      })
    }

    const handleFail = (error) => {
      if (settled) return
      settled = true
      clearTimeout(timeoutTimer)
      reject(error || { errMsg: '云函数调用失败' })
    }

    if (ensureWxCloudReady() && wx?.cloud?.callFunction) {
      wx.cloud.callFunction({
        name: CLOUD_FUNCTION_NAME,
        data: payload,
        success: handleSuccess,
        fail: handleFail
      })
      return
    }

    if (typeof uniCloud !== 'undefined' && uniCloud?.callFunction) {
      uniCloud.callFunction({
        name: CLOUD_FUNCTION_NAME,
        data: payload,
        success: handleSuccess,
        fail: handleFail
      })
      return
    }

    clearTimeout(timeoutTimer)
    settled = true
    reject({ errMsg: '当前环境未启用云函数能力，请检查云开发配置' })
  })

/** 统一请求入口：有可用 BASE_URL 走 HTTP，否则走云函数。 */
export const request = (options = {}) => {
  const token = uni.getStorageSync('yc_token')
  const openid = resolveOpenid()
  const data = attachOpenid(options.data, openid)
  const method = normalizeMethod(options.method || 'GET')
  const header = {
    ...(options.header || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  if (shouldUseHttp(options.url)) {
    return requestByHttp({
      ...options,
      method,
      data,
      header,
      url: resolveHttpUrl(options.url || '')
    })
  }

  return requestByCloudFunction({
    url: options.url || '',
    method,
    data,
    header,
    token
  })
}
