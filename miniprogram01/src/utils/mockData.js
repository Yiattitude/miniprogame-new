import { getHonorLevel, getVolunteerModule } from '@/utils/rules'

const APPLICATION_STORAGE_KEY = 'yc_demo_applications'
const IMPORT_STORAGE_KEY = 'yc_demo_import_history'
const LOG_STORAGE_KEY = 'yc_demo_operation_logs'

const applicationStatusMap = {
  pending: { text: '待审核', tagType: 'warning' },
  approved: { text: '已通过', tagType: 'success' },
  rejected: { text: '已驳回', tagType: 'error' }
}

const deepClone = (value) => JSON.parse(JSON.stringify(value))

/** 将演示数据中的日期字符串转成 iOS 可稳定识别的格式。 */
const normalizeDateTimeString = (value) => {
  if (typeof value !== 'string') return value

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) {
    return value.replace(' ', 'T') + ':00'
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.replace(' ', 'T')
  }

  return value
}

/** 统一解析时间，避免 iOS 对 `yyyy-MM-dd HH:mm` 格式告警。 */
const parseMockDate = (value) => {
  const normalizedValue = normalizeDateTimeString(value)
  return new Date(normalizedValue).getTime()
}

/** 生成展示用时间字符串，统一为 `yyyy-MM-dd HH:mm`。 */
const formatMockDateTime = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

/** 生成固定的前端演示申报数据，便于纯前端阶段联调页面。 */
const createSeedApplications = () => [
  {
    id: 'apply-001',
    type: 'volunteer',
    moduleId: 'red-culture',
    title: '红色故事进社区宣讲',
    location: '徐汇区老干部活动中心',
    content: '围绕党史故事开展专题宣讲，并与青少年互动交流。',
    activityTime: '2026-03-18 14:00',
    submitTime: '2026-03-19 09:20',
    applicantName: '张建国',
    applicantIdCard: '310101195801015678',
    claimedPoints: 8,
    approvedPoints: 8,
    status: 'approved',
    rejectReason: '',
    evidenceFiles: ['现场照片-1.jpg', '活动签到表.jpg']
  },
  {
    id: 'apply-002',
    type: 'honor',
    levelId: 'provincial',
    title: '2026年度先进离退休干部',
    organization: '上海市老干部局',
    content: '荣获省部级先进个人表彰。',
    activityTime: '2026-03-10 10:00',
    submitTime: '2026-03-12 11:30',
    applicantName: '张建国',
    applicantIdCard: '310101195801015678',
    claimedPoints: 16,
    approvedPoints: 0,
    status: 'pending',
    rejectReason: '',
    evidenceFiles: ['获奖证书.jpg']
  },
  {
    id: 'apply-003',
    type: 'volunteer',
    moduleId: 'community-governance',
    title: '社区安全巡逻服务',
    location: '天平街道衡山社区',
    content: '参与晚间社区巡逻与矛盾调解。',
    activityTime: '2026-02-28 19:30',
    submitTime: '2026-03-01 09:00',
    applicantName: '张建国',
    applicantIdCard: '310101195801015678',
    claimedPoints: 5,
    approvedPoints: 0,
    status: 'rejected',
    rejectReason: '佐证材料不够清晰，请补充现场照片后重提。',
    evidenceFiles: ['巡逻合影.jpg']
  },
  {
    id: 'apply-004',
    type: 'volunteer',
    moduleId: 'enterprise-service',
    title: '企业技术经验分享',
    location: '闵行科创园',
    content: '为初创企业开展设备维护经验讲座。',
    activityTime: '2025-11-08 13:30',
    submitTime: '2025-11-09 08:40',
    applicantName: '张建国',
    applicantIdCard: '310101195801015678',
    claimedPoints: 6,
    approvedPoints: 6,
    status: 'approved',
    rejectReason: '',
    evidenceFiles: ['讲座照片.jpg', '签到表.png']
  },
  {
    id: 'apply-005',
    type: 'honor',
    levelId: 'national',
    title: '全国离退休干部先进个人',
    organization: '中组部',
    content: '获得国家级荣誉表彰。',
    activityTime: '2025-05-20 09:00',
    submitTime: '2025-05-21 15:20',
    applicantName: '张建国',
    applicantIdCard: '310101195801015678',
    claimedPoints: 20,
    approvedPoints: 20,
    status: 'approved',
    rejectReason: '',
    evidenceFiles: ['国家级荣誉证书.jpg']
  },
  {
    id: 'apply-006',
    type: 'volunteer',
    moduleId: 'elder-help',
    title: '困难老同志上门帮扶',
    location: '康健街道',
    content: '上门陪伴与生活物资代购服务。',
    activityTime: '2024-09-15 08:30',
    submitTime: '2024-09-16 10:00',
    applicantName: '张建国',
    applicantIdCard: '310101195801015678',
    claimedPoints: 4,
    approvedPoints: 4,
    status: 'approved',
    rejectReason: '',
    evidenceFiles: ['帮扶记录表.jpg']
  },
  {
    id: 'apply-007',
    type: 'honor',
    levelId: 'factory',
    title: '街道优秀志愿者表彰',
    organization: '天平街道党工委',
    content: '荣获厂处级荣誉表彰。',
    activityTime: '2023-12-22 09:30',
    submitTime: '2023-12-23 09:10',
    applicantName: '张建国',
    applicantIdCard: '310101195801015678',
    claimedPoints: 10,
    approvedPoints: 10,
    status: 'approved',
    rejectReason: '',
    evidenceFiles: ['表彰照片.jpg']
  },
  {
    id: 'apply-008',
    type: 'volunteer',
    moduleId: 'other-service',
    title: '社区环境清洁志愿服务',
    location: '枫林街道',
    content: '参与社区清洁、垃圾分类宣传。',
    activityTime: '2026-03-22 08:00',
    submitTime: '2026-03-22 17:20',
    applicantName: '张建国',
    applicantIdCard: '310101195801015678',
    claimedPoints: 3,
    approvedPoints: 0,
    status: 'pending',
    rejectReason: '',
    evidenceFiles: ['志愿活动照.jpg']
  },
  {
    id: 'apply-009',
    type: 'volunteer',
    moduleId: 'red-culture',
    title: '青少年国防教育宣讲',
    location: '虹口区少年宫',
    content: '开展国防教育宣讲活动。',
    activityTime: '2022-06-15 09:00',
    submitTime: '2022-06-16 08:30',
    applicantName: '张建国',
    applicantIdCard: '310101195801015678',
    claimedPoints: 3,
    approvedPoints: 3,
    status: 'approved',
    rejectReason: '',
    evidenceFiles: ['宣讲现场.jpg']
  }
]

/** 初始化演示用操作日志。 */
const createSeedLogs = () => [
  {
    id: 'log-001',
    operator: '系统管理员',
    time: '2026-03-20 10:20',
    content: '审核通过志愿服务申报《红色故事进社区宣讲》',
    ip: '127.0.0.1'
  },
  {
    id: 'log-002',
    operator: '系统管理员',
    time: '2026-03-18 09:15',
    content: '导出演示数据 12 条',
    ip: '127.0.0.1'
  },
  {
    id: 'log-003',
    operator: '系统管理员',
    time: '2026-03-15 14:05',
    content: '导入 Excel 演示数据 28 条',
    ip: '127.0.0.1'
  }
]

/** 初始化演示导入历史。 */
const createSeedImportHistory = () => [
  {
    id: 'import-001',
    fileName: '志愿服务积分导入模板-样例.xlsx',
    importedCount: 28,
    operator: '系统管理员',
    time: '2026-03-15 14:05',
    status: 'success'
  }
]

/** 读取本地缓存，若为空则写入默认演示数据。 */
const ensureStorage = (key, seedFactory) => {
  const stored = uni.getStorageSync(key)
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored
  }
  const seed = seedFactory()
  uni.setStorageSync(key, seed)
  return seed
}

/** 获取全部演示申报记录。 */
export const getDemoApplications = () =>
  deepClone(
    ensureStorage(APPLICATION_STORAGE_KEY, createSeedApplications).sort(
      (left, right) => parseMockDate(right.submitTime) - parseMockDate(left.submitTime)
    )
  )

/** 保存全部申报记录。 */
const saveDemoApplications = (records) => {
  uni.setStorageSync(APPLICATION_STORAGE_KEY, deepClone(records))
}

/** 获取状态对应的标签样式。 */
export const getApplicationStatusMeta = (status) =>
  applicationStatusMap[status] || applicationStatusMap.pending

/** 根据记录类型补充中文模块名称，便于各页面统一展示。 */
export const decorateApplication = (record) => {
  const statusMeta = getApplicationStatusMeta(record.status)
  const moduleInfo = record.type === 'volunteer' ? getVolunteerModule(record.moduleId) : null
  const levelInfo = record.type === 'honor' ? getHonorLevel(record.levelId) : null
  const categoryName = record.type === 'volunteer' ? moduleInfo?.name || '志愿服务' : levelInfo?.name || '荣誉获奖'

  return {
    ...record,
    categoryName,
    statusText: statusMeta.text,
    tagType: statusMeta.tagType
  }
}

/** 获取“我的申请”统计信息。 */
export const getApplicationStats = () => {
  const records = getDemoApplications()
  return {
    pending: records.filter((item) => item.status === 'pending').length,
    approved: records.filter((item) => item.status === 'approved').length,
    rejected: records.filter((item) => item.status === 'rejected').length
  }
}

/** 驳回记录支持本地重提，模拟用户修改后重新进入待审核。 */
export const resubmitDemoApplication = (recordId) => {
  const records = getDemoApplications()
  const nextRecords = records.map((item) =>
    item.id === recordId
      ? {
          ...item,
          status: 'pending',
          rejectReason: '',
          submitTime: formatMockDateTime()
        }
      : item
  )
  saveDemoApplications(nextRecords)
  appendOperationLog('普通用户', `重提申报《${records.find((item) => item.id === recordId)?.title || ''}》`)
  return nextRecords
}

/** 获取志愿服务年度记录，供“打卡记录”页面展示。 */
export const getVolunteerRecordList = ({ year, moduleId }) =>
  getDemoApplications()
    .filter((item) => item.type === 'volunteer' && item.status === 'approved')
    .filter((item) => !year || item.activityTime.startsWith(String(year)))
    .filter((item) => !moduleId || item.moduleId === moduleId)
    .map((item) => decorateApplication(item))

/** 根据演示申报数据统计年度积分趋势。 */
export const getAnnualScoreTrend = () => {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, index) => currentYear - 4 + index)
  const approvedRecords = getDemoApplications().filter((item) => item.status === 'approved')

  return years.map((year) => {
    const yearRecords = approvedRecords.filter((item) => item.activityTime.startsWith(String(year)))
    const volunteer = yearRecords
      .filter((item) => item.type === 'volunteer')
      .reduce((total, item) => total + Number(item.approvedPoints || 0), 0)
    const honor = yearRecords
      .filter((item) => item.type === 'honor')
      .reduce((total, item) => total + Number(item.approvedPoints || 0), 0)

    return {
      year: String(year),
      volunteer,
      honor,
      total: volunteer + honor
    }
  })
}

/** 获取首页和“我的”页面所需的积分汇总。 */
export const getOverallScoreSummary = () => {
  const records = getDemoApplications().filter((item) => item.status === 'approved')
  const volunteerPoints = records
    .filter((item) => item.type === 'volunteer')
    .reduce((total, item) => total + Number(item.approvedPoints || 0), 0)
  const honorPoints = records
    .filter((item) => item.type === 'honor')
    .reduce((total, item) => total + Number(item.approvedPoints || 0), 0)

  return {
    volunteerPoints,
    honorPoints,
    totalPoints: volunteerPoints + honorPoints
  }
}

/** 获取前端演示版管理员统计卡片。 */
export const getAdminDashboardSummary = () => {
  const records = getDemoApplications()
  const pendingVolunteerCount = records.filter(
    (item) => item.type === 'volunteer' && item.status === 'pending'
  ).length
  const pendingHonorCount = records.filter((item) => item.type === 'honor' && item.status === 'pending').length
  const approvedCount = records.filter((item) => item.status === 'approved').length
  const rejectedCount = records.filter((item) => item.status === 'rejected').length

  return {
    pendingVolunteerCount,
    pendingHonorCount,
    approvedCount,
    rejectedCount
  }
}

/** 获取管理员审核页列表。 */
export const getAdminAuditRecords = () =>
  getDemoApplications().map((item) => ({
    ...decorateApplication(item),
    applicantLabel: `${item.applicantName} | ${item.applicantIdCard.slice(-4)}`,
    desc:
      item.type === 'volunteer'
        ? `申报积分 ${item.claimedPoints} | ${item.submitTime}`
        : `${getHonorLevel(item.levelId)?.name || '荣誉获奖'} | ${item.submitTime}`
  }))

/** 按管理员审核结果更新本地演示数据。 */
export const updateDemoAuditRecord = (recordId, payload = {}) => {
  const records = getDemoApplications()
  const nextRecords = records.map((item) => {
    if (item.id !== recordId) return item

    return {
      ...item,
      ...payload,
      approvedPoints:
        payload.status === 'approved'
          ? Number(payload.approvedPoints ?? item.claimedPoints ?? item.approvedPoints ?? 0)
          : payload.status === 'rejected'
            ? 0
            : item.approvedPoints
    }
  })

  saveDemoApplications(nextRecords)
  const target = nextRecords.find((item) => item.id === recordId)
  const actionText =
    payload.status === 'approved'
      ? `审核通过《${target?.title || ''}》`
      : payload.status === 'rejected'
        ? `驳回《${target?.title || ''}》`
        : `更新《${target?.title || ''}》`
  appendOperationLog('系统管理员', actionText)
  return nextRecords
}

/** 批量审核时统一更新多条记录。 */
export const updateDemoAuditRecordsBatch = (recordIds, payload = {}) => {
  let records = getDemoApplications()
  recordIds.forEach((recordId) => {
    records = updateDemoAuditRecord(recordId, payload)
  })
  appendOperationLog(
    '系统管理员',
    `${payload.status === 'approved' ? '批量通过' : '批量驳回'} ${recordIds.length} 条申报`
  )
  return records
}

/** 获取导入模板字段说明。 */
export const getImportTemplateFields = () => ({
  volunteer: ['用户姓名', '身份证号', '模块标识', '活动名称', '时间', '地点', '参与内容', '积分', '佐证材料链接'],
  honor: ['用户姓名', '身份证号', '荣誉级别', '荣誉名称', '获取时间', '授奖单位', '佐证材料链接']
})

/** 获取导入历史列表。 */
export const getImportHistory = () =>
  deepClone(
    ensureStorage(IMPORT_STORAGE_KEY, createSeedImportHistory).sort(
      (left, right) => parseMockDate(right.time) - parseMockDate(left.time)
    )
  )

/** 模拟前端导入成功后的历史记录。 */
export const simulateImportHistory = () => {
  const current = getImportHistory()
  const newItem = {
    id: `import-${Date.now()}`,
    fileName: `批量导入-${new Date().toISOString().slice(0, 10)}.xlsx`,
    importedCount: 16,
    operator: '系统管理员',
    time: formatMockDateTime(),
    status: 'success'
  }
  const nextHistory = [newItem, ...current]
  uni.setStorageSync(IMPORT_STORAGE_KEY, deepClone(nextHistory))
  appendOperationLog('系统管理员', `导入 Excel 演示数据 ${newItem.importedCount} 条`)
  return deepClone(nextHistory)
}

/** 读取最近操作日志。 */
export const getOperationLogs = () =>
  deepClone(
    ensureStorage(LOG_STORAGE_KEY, createSeedLogs).sort(
      (left, right) => parseMockDate(right.time) - parseMockDate(left.time)
    )
  )

/** 追加管理员操作日志，便于首页展示。 */
export const appendOperationLog = (operator, content) => {
  const current = getOperationLogs()
  const newItem = {
    id: `log-${Date.now()}`,
    operator,
    time: formatMockDateTime(),
    content,
    ip: '127.0.0.1'
  }
  uni.setStorageSync(LOG_STORAGE_KEY, deepClone([newItem, ...current]))
}

/** 根据筛选条件生成导出预览结果。 */
export const getExportPreviewRows = (filters = {}) =>
  getDemoApplications()
    .filter((item) => !filters.year || item.activityTime.startsWith(filters.year.trim()))
    .filter((item) => {
      if (!filters.module) return true
      const keyword = filters.module.trim()
      const moduleName =
        item.type === 'volunteer' ? getVolunteerModule(item.moduleId)?.name || '' : getHonorLevel(item.levelId)?.name || ''
      return item.title.includes(keyword) || moduleName.includes(keyword)
    })
    .filter((item) => !filters.status || getApplicationStatusMeta(item.status).text.includes(filters.status.trim()))
    .filter((item) => {
      if (!filters.keyword) return true
      const keyword = filters.keyword.trim()
      return (
        item.applicantName.includes(keyword) ||
        item.applicantIdCard.includes(keyword) ||
        item.title.includes(keyword)
      )
    })
    .map((item) => ({
      id: item.id,
      applicantName: item.applicantName,
      typeLabel: item.type === 'volunteer' ? '志愿服务' : '荣誉获奖',
      moduleLabel:
        item.type === 'volunteer' ? getVolunteerModule(item.moduleId)?.name || '志愿服务' : getHonorLevel(item.levelId)?.name || '荣誉获奖',
      title: item.title,
      statusText: getApplicationStatusMeta(item.status).text,
      scoreText: `${item.status === 'approved' ? item.approvedPoints : item.claimedPoints} 分`,
      submitTime: item.submitTime
    }))

/** 模拟导出动作并记录操作日志。 */
export const simulateExportAction = (count) => {
  appendOperationLog('系统管理员', `导出演示数据 ${count} 条`)
}
