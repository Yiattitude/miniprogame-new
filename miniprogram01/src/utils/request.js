const BASE_URL = import.meta.env.VITE_BASE_URL || ''

export const request = (options) =>
  new Promise((resolve, reject) => {
    const token = uni.getStorageSync('yc_token')
    uni.request({
      ...options,
      url: `${BASE_URL}${options.url || ''}`,
      header: {
        ...(options.header || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    })
  })
