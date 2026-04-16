export const volunteerModules = [
  {
    id: 'red-culture',
    name: '传承红色文化（关心下一代）',
    desc: '红色宣讲、青少年教育等',
    min: 3,
    max: 10,
    rules: [
      '开展党史、革命史、优良传统、老党员先进事迹等红色主题宣讲',
      '参与青少年教育、辅导、关爱等志愿服务'
    ]
  },
  {
    id: 'community-governance',
    name: '参与基层治理',
    desc: '政策宣传、矛盾调解等',
    min: 1,
    max: 5,
    rules: [
      '参与社区政策宣传活动，传播政策知识',
      '参与社区议事、政策建议、管理监督等工作',
      '参与社区邻里矛盾、家庭纠纷调解工作',
      '参与社区治安巡逻、信访维稳等维护稳定工作',
      '参与社区健康宣传、义诊、环境整治等活动'
    ]
  },
  {
    id: 'enterprise-service',
    name: '服务企业发展',
    desc: '技术咨询、经验指导等',
    min: 3,
    max: 10,
    rules: [
      '以参加座谈会、调研、线下讲座、线上授课、课题研究等形式为企业提供技术咨询、经验指导、人才培养'
    ]
  },
  {
    id: 'elder-help',
    name: '实施以老助老',
    desc: '帮扶困难老同志等',
    min: 1,
    max: 5,
    rules: ['帮扶困难老同志、独居老人等特殊群体']
  },
  {
    id: 'other-service',
    name: '其他服务',
    desc: '未涵盖的社区服务',
    min: 1,
    max: 5,
    rules: ['未涵盖的其他社区志愿服务']
  }
]

export const honorLevels = [
  {
    id: 'national',
    name: '国家级荣誉',
    points: 20
  },
  {
    id: 'provincial',
    name: '省部级荣誉',
    points: 16
  },
  {
    id: 'bureau',
    name: '厅局级荣誉',
    points: 12
  },
  {
    id: 'factory',
    name: '厂处级荣誉',
    points: 10
  }
]

export const getVolunteerModule = (moduleId) =>
  volunteerModules.find((item) => item.id === moduleId)

export const getHonorLevel = (levelId) => honorLevels.find((item) => item.id === levelId)

/** 脱敏展示姓名，避免在前端直接暴露完整身份信息。 */
export const maskName = (value) => {
  if (!value) return ''
  if (value.length === 1) return `${value}*`
  return `${value.slice(0, 1)}*`
}

export const maskIdCard = (value) => {
  if (!value) return ''
  if (value.length < 8) return value
  return `${value.slice(0, 3)}***********${value.slice(-4)}`
}

/** 脱敏展示手机号，避免在前端完整暴露联系方式。 */
export const maskPhone = (value) => {
  if (!value) return ''
  if (value.length < 7) return value
  return `${value.slice(0, 3)}****${value.slice(-4)}`
}

export const isIdCardValid = (value) => {
  if (!value) return false
  const trimmed = value.trim()
  return /(^\d{15}$)|(^\d{17}[\dXx]$)/.test(trimmed)
}

/** 校验中国大陆手机号格式。 */
export const isPhoneValid = (value) => {
  if (!value) return false
  return /^1[3-9]\d{9}$/.test(value.trim())
}
