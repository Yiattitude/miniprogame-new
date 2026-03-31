/** 统一解析后端响应，失败时抛出带 message 的错误。 */
export const unwrapApiData = (response, fallback = null) => {
  const payload = response?.data
  if (!payload || typeof payload !== 'object') {
    throw new Error('接口返回格式异常')
  }

  if (Number(payload.code) !== 0) {
    throw new Error(payload.message || '请求失败')
  }

  return payload.data ?? fallback
}

/** 提取错误提示文案，避免页面重复写兜底逻辑。 */
export const resolveApiErrorMessage = (error, fallback = '请求失败，请稍后重试') =>
<<<<<<< HEAD
  error?.message || error?.errMsg || fallback
=======
  error?.message || error?.errMsg || fallback
>>>>>>> 878cd6bb1484add6c8c69c532b51c57c09a991eb
