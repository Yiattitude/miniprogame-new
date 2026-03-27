export const volunteerModules = [
  {
    id: 'red-culture',
    name: '传承红色文化（关心下一代）',
    desc: '红色宣讲、青少年教育等',
    min: 3,
    max: 10
  },
  {
    id: 'community-governance',
    name: '参与基层治理',
    desc: '政策宣传、矛盾调解等',
    min: 1,
    max: 5
  },
  {
    id: 'enterprise-service',
    name: '服务企业发展',
    desc: '技术咨询、经验指导等',
    min: 3,
    max: 10
  },
  {
    id: 'elder-help',
    name: '实施以老助老',
    desc: '帮扶困难老同志等',
    min: 1,
    max: 5
  },
  {
    id: 'other-service',
    name: '其他服务',
    desc: '未涵盖的社区服务',
    min: 1,
    max: 5
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
