import { defineStore } from 'pinia'

const STORAGE_KEY = 'yc_user_state'
const ADMIN_ROLE_SET = new Set(['admin', 'super-admin'])

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    phone: '',
    role: 'member',
    isAdmin: false,
    openid: '',
    token: '',
    privacyAgreed: false,
    privacyAgreedAt: '',
    sessionCode: '',
    loginAt: '',
    realnameVerified: false,
    realnameSubmittedAt: '',
    subscribeAuditResult: 'unknown',
    subscribeUpdatedAt: '',
    albumPermission: 'unknown',
    cameraPermission: 'unknown',
    volunteerPoints: 0,
    honorPoints: 0
  }),
  getters: {
    totalPoints: (state) => state.volunteerPoints + state.honorPoints,
    hasRealname: (state) => state.realnameVerified && !!(state.name && state.phone)
  },
  actions: {
    /** 初始化本地缓存，恢复登录与合规状态。 */
    initFromStorage() {
      const saved = uni.getStorageSync(STORAGE_KEY)
      if (saved) {
        this.name = saved.name || ''
        this.phone = saved.phone || saved.idCard || ''
        this.role = saved.role || 'member'
        this.isAdmin = !!saved.isAdmin
        this.openid = saved.openid || ''
        this.token = saved.token || ''
        this.privacyAgreed = !!saved.privacyAgreed
        this.privacyAgreedAt = saved.privacyAgreedAt || ''
        this.sessionCode = saved.sessionCode || ''
        this.loginAt = saved.loginAt || ''
        this.realnameVerified = !!saved.realnameVerified
        this.realnameSubmittedAt = saved.realnameSubmittedAt || ''
        this.subscribeAuditResult = saved.subscribeAuditResult || 'unknown'
        this.subscribeUpdatedAt = saved.subscribeUpdatedAt || ''
        this.albumPermission = saved.albumPermission || 'unknown'
        this.cameraPermission = saved.cameraPermission || 'unknown'
        this.volunteerPoints = Number(saved.volunteerPoints || 0)
        this.honorPoints = Number(saved.honorPoints || 0)
      }
    },
    /** 持久化用户状态，保证重启后仍可恢复流程。 */
    persist() {
      uni.setStorageSync(STORAGE_KEY, {
        name: this.name,
        phone: this.phone,
        role: this.role,
        isAdmin: this.isAdmin,
        openid: this.openid,
        token: this.token,
        privacyAgreed: this.privacyAgreed,
        privacyAgreedAt: this.privacyAgreedAt,
        sessionCode: this.sessionCode,
        loginAt: this.loginAt,
        realnameVerified: this.realnameVerified,
        realnameSubmittedAt: this.realnameSubmittedAt,
        subscribeAuditResult: this.subscribeAuditResult,
        subscribeUpdatedAt: this.subscribeUpdatedAt,
        albumPermission: this.albumPermission,
        cameraPermission: this.cameraPermission,
        volunteerPoints: this.volunteerPoints,
        honorPoints: this.honorPoints
      })
    },
    /** 记录隐私协议同意状态和同意时间。 */
    setPrivacyAgreed(value) {
      this.privacyAgreed = !!value
      this.privacyAgreedAt = value ? new Date().toISOString() : ''
      this.persist()
    },
    /** 更新管理员身份，供 TabBar 和页面显隐判断。 */
    setAdmin(value) {
      this.isAdmin = !!value
      this.persist()
    },
    /** 写入微信登录换取到的会话凭证。 */
    setLoginSession(payload = {}) {
      this.sessionCode = payload.sessionCode || ''
      this.openid = payload.openid || this.openid
      this.token = payload.token || this.token
      this.loginAt = payload.loginAt || ''
      if (this.openid) {
        uni.setStorageSync('yc_openid', this.openid)
      }
      if (this.token) {
        uni.setStorageSync('yc_token', this.token)
      }
      this.persist()
    },
    /** 写入后端返回的登录态与角色信息。 */
    setAuthInfo(payload = {}) {
      this.openid = payload.openid || this.openid
      this.token = payload.token || this.token
      if (typeof payload.isAdmin === 'boolean') {
        this.isAdmin = payload.isAdmin
      }
      if (this.openid) {
        uni.setStorageSync('yc_openid', this.openid)
      }
      if (this.token) {
        uni.setStorageSync('yc_token', this.token)
      }
      this.persist()
    },
    /** 写入用户认证信息，并标记前端认证流程已完成。 */
    setUserInfo(payload) {
      this.name = payload?.name || payload?.realName || ''
      // 兼容旧缓存中使用 idCard 字段存手机号的历史数据。
      this.phone = payload?.phone || payload?.idCard || ''
      this.role = payload?.role || this.role || 'member'
      this.realnameVerified = !!(payload?.name && this.phone)
      if (!this.realnameVerified && payload?.realName) {
        this.realnameVerified = !!(payload.realName && this.phone)
      }
      if (payload?.role) {
        this.isAdmin = ADMIN_ROLE_SET.has(payload.role)
      }
      this.realnameSubmittedAt =
        payload?.submittedAt || (this.realnameVerified ? new Date().toISOString() : '')
      this.persist()
    },
    /** 记录订阅消息申请结果，便于“我的”页面展示。 */
    setSubscribeStatus(status) {
      this.subscribeAuditResult = status || 'unknown'
      this.subscribeUpdatedAt = new Date().toISOString()
      this.persist()
    },
    /** 记录相册或相机权限状态，用于隐私设置页展示。 */
    setPermissionStatus(type, status) {
      if (type === 'album') {
        this.albumPermission = status || 'unknown'
      }
      if (type === 'camera') {
        this.cameraPermission = status || 'unknown'
      }
      this.persist()
    },
    /** 更新积分展示数据。 */
    setPoints({ volunteerPoints, honorPoints }) {
      if (typeof volunteerPoints === 'number') this.volunteerPoints = volunteerPoints
      if (typeof honorPoints === 'number') this.honorPoints = honorPoints
      this.persist()
    },
    /** 退出登录时清理会话信息，但保留已同意的隐私协议。 */
    reset() {
      const agreed = this.privacyAgreed
      const agreedAt = this.privacyAgreedAt
      const albumPermission = this.albumPermission
      const cameraPermission = this.cameraPermission
      this.name = ''
      this.phone = ''
      this.role = 'member'
      this.isAdmin = false
      this.openid = ''
      this.token = ''
      this.privacyAgreed = agreed
      this.privacyAgreedAt = agreedAt
      this.sessionCode = ''
      this.loginAt = ''
      this.realnameVerified = false
      this.realnameSubmittedAt = ''
      this.subscribeAuditResult = 'unknown'
      this.subscribeUpdatedAt = ''
      this.albumPermission = albumPermission
      this.cameraPermission = cameraPermission
      this.volunteerPoints = 0
      this.honorPoints = 0
      uni.removeStorageSync('yc_openid')
      uni.removeStorageSync('yc_token')
      this.persist()
    }
  }
})
