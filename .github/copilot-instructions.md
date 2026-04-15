# 银才荟小程序 - AI 编程指南

**项目类型**：微信小程序（uni-app + Vue3 + Vite）  
**最后更新**：2026 年 4 月  
**详细规范**：参考根目录 [AGENTS.md](../AGENTS.md) 文档

---

## 项目概述

志愿服务与荣誉获奖积分申报小程序，服务于老同志（普通用户）与管理员。严格遵循《微信小程序平台运营规范》与《个人信息保护法》，确保上线零驳回。

### 核心目标
1. 老同志便捷申报志愿服务、荣誉获奖并查看积分
2. 管理员批量导入、审核申报、导出数据
3. 100% 微信官方合规（内容安全、隐私保护、权限申请）

---

## 开发环境与技术栈

| 技术/工具 | 版本 | 用途 |
|---------|------|------|
| uni-app | 3.0+ | 跨端开发框架（主要面向微信小程序） |
| Vue | 3.5+ | 前端框架，使用 `<script setup>` 组合式 API |
| Vite | 5.2+ | 构建工具 |
| Pinia | 3.0+ | 状态管理 |
| uView Plus | 3.7+ | UI 组件库 |
| ESLint + Prettier | 最新 | 代码规范化 |

### 快速启动
```bash
cd miniprogram01
npm install
npm run dev:mp-weixin  # 开发 → 微信开发者工具
npm run build:mp-weixin # 生产构建
npm run lint # 代码检查与修复
npm run format # 代码格式化
```

---

## AI 编程核心规则

### 1. 需求必问三件事
接到编程任务时，**先向用户确认**：
- **最终业务目标**：该功能达成什么目的？面向哪群用户？
- **代码运行环境**：前端页面、云函数、还是其他？
- **技术栈 / 版本限制**：是否有特定框架/库的要求？禁用哪些技术？

**禁止无确认直接生成代码**。

### 2. 最小可用原则
- 优先实现**核心需求**，不擅自添加冗余功能
- 每项新增第三方依赖，必须提前说明：依赖名称、版本、核心用途，**征得同意后再使用**
- 所有修改必须与 AGENTS.md 的业务需求对齐

### 3. 设计方案评估
如需求存在歧义或有多种可行方案，**先列出 2-3 种主流方案**：
- 说明各方案的优劣、适用场景、开发成本
- **征得用户选定方案的明确意见后**，再推进开发

### 4. 代码注释要求（中文）
- **每个页面、组件、函数** 必须添加 `/** 注释 */` 说明用途
- **复杂逻辑、表单校验、权限判断、接口请求** 必须添加行内注释
- **数据来源、状态更新、页面跳转** 必须标注注释
- **表单字段、积分规则、权限判断** 必须注释说明规则

示例：
```javascript
/**
 * 获取用户申报记录
 * @param {string} year - 年度，格式：2026
 * @param {string} type - 申报类型：volunteer（志愿服务）| honor（荣誉获奖）
 * @returns {Promise<Array>} 申报记录列表
 */
async function getApplicationRecords(year, type) {
  // 从 Pinia store 中获取 token，用于接口请求认证
  const { userToken } = useUserStore()
  
  // 调用后端接口，查询当前用户的申报记录
  const response = await request.get('/api/applications', {
    params: { year, type, token: userToken }
  })
  
  return response.data || []
}
```

### 5. 完成后必须说明
每一项编程任务完成后，**必须用通俗简明的语言向用户完整说明**：
- **任务实现逻辑**：做了什么，为什么这样做
- **核心流程**：关键步骤有哪些
- **关键细节**：需要用户注意的地方、配置项、环境要求

确保用户能清晰理解代码的运行原理与使用方式。

---

## 代码规范详解

### 1. 命名约定

| 类型 | 格式 | 示例 |
|------|------|------|
| 页面文件 | kebab-case（小写 + 连字符） | `volunteer-checkin.vue` |
| 组件文件 | PascalCase（大驼峰） | `VolunteerCard.vue` |
| 变量 / 函数 | camelCase（小驼峰） | `handleSubmit()`, `userInfo` |
| 常量 | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE = 10` |
| Pinia store | 小驼峰 + 后缀 Store | `useUserStore()` |

### 2. 文件与组件结构

**页面示例**（`src/pages/volunteer/checkin.vue`）：
```vue
<template>
  <!-- 页面内容 -->
</template>

<script setup>
// 导入语句（ESLint 会自动排序）
// 组件逻辑：状态、计算属性、函数、生命周期钩子
</script>

<style lang="scss" scoped>
/* 页面样式，scoped 避免污染 */
</style>
```

**组件示例**（`src/components/VolunteerCard.vue`）：
```vue
<template>
  <!-- 高度可复用的小组件 -->
</template>

<script setup>
/**
 * 志愿服务卡片组件
 * 展示单条申报记录的摘要信息，支持点击跳转详情页
 */
const props = defineProps({
  record: Object, // 申报记录数据
  onDetail: Function // 点击详情的回调
})
</script>

<style lang="scss" scoped></style>
```

### 3. 样式规范

- **全局样式** 在 `src/App.vue` 或 `src/uni.scss` 中引入
- **页面 / 组件样式** 使用 `scoped` 避免全局污染
- **uView Plus 组件** 优先使用官方样式，自定义通过 `::v-deep` 修改：
  ```scss
  .my-button ::v-deep .u-btn {
    height: 50px; // 自定义高度
  }
  ```

### 4. 无障碍与老同志适配

根据 AGENTS.md 的无障碍规范：
- **字体**：全站 ≥ 16px（默认值）
- **按钮点击区域**：≥ 48px × 48px（微信无障碍规范）
- **对比度**：文本与背景对比度 ≥ 4.5:1
- **操作**：极简设计，无冗余步骤，支持微信读屏模式

---

## 核心模块开发指南

### 模块结构
```
src/
├── pages/                      # 页面目录
│   ├── volunteer/              # 志愿服务模块
│   │   ├── index.vue          # 志愿服务列表
│   │   ├── checkin.vue        # 打卡页面
│   │   └── record.vue         # 打卡记录
│   ├── honor/                 # 荣誉获奖模块
│   │   ├── index.vue          # 荣誉列表
│   │   └── apply.vue          # 申报页面
│   ├── admin/                 # 管理员模块
│   │   ├── index.vue          # 后台首页
│   │   ├── audit.vue          # 审核模块
│   │   └── export.vue         # 数据导出
│   └── mine/                  # 个人中心
│       └── mine.vue           # 我的页面
├── components/                # 公共组件
├── store/                     # Pinia 状态管理
├── api/                       # 接口模块
├── utils/                     # 工具函数
└── assets/                    # 静态资源
```

### 管理员权限补充（2026-04）

- 账号创建仅支持用户首次登录自动建档，不提供管理员新增用户能力。
- 新增角色层级：`super-admin` / `admin` / `member`，仅上级可修改下级角色。
- 系统仅保留 1 个 `super-admin`。
- 仅 `super-admin` 拥有设置/回收管理员权限（`member <-> admin`）。
- 禁止任何角色自改权限，且 `super-admin` 不可降级。
- 全量导出必须包含：总积分、志愿服务积分、荣誉获奖积分、总排名、业绩明细与佐证材料链接。
- 用户删除默认采用逻辑删除，物理删除仅在合规审批通过后执行，并保留审计记录。

### 关键业务规则（必须硬编码或通过 API 获取）

**志愿服务积分限制**：
```javascript
// src/utils/rules.js
export const VOLUNTEER_RULES = {
  'red-culture': { name: '传承红色文化', min: 3, max: 10 },
  'governance': { name: '参与基层治理', min: 1, max: 5 },
  'enterprise': { name: '服务企业发展', min: 3, max: 10 },
  'help-old': { name: '实施以老助老', min: 1, max: 5 },
  'other': { name: '其他服务', min: 1, max: 5 }
}
```

**荣誉获奖积分（固定值，不可修改）**：
```javascript
export const HONOR_POINTS = {
  'national': 20,     // 国家级
  'provincial': 16,   // 省部级
  'bureau': 12,       // 厅局级
  'factory': 10       // 厂处级
}
```

---

## 微信合规集成

### 权限申请铁律

❌ **禁止**：页面加载时提前申请权限  
❌ **禁止**：未告知用户就申请权限  
✅ **正确**：用户触发功能时申请，先弹窗说明用途

### 常用微信接口

| 功能 | uni-app API | 调用时机 | 说明 |
|-----|------------|--------|------|
| 登录 | `uni.login()` | 启动 / 授权后 | 获取 openid |
| 选择媒体 | `uni.chooseMedia()` | 用户点击上传 | 申请相册权限 |
| 内容校验 | 后端调用 `msgSecCheck`, `imgSecCheck` | 提交申报 | 文本 / 图片合规检测 |
| 订阅通知 | `uni.requestSubscribeMessage()` | 申报成功后 | 请求用户订阅通知 |

### 敏感信息处理

- **前端脱敏**：身份证号显示为 `340* *** ****** *234`
- **后端加密**：姓名、身份证号使用 AES 加密存储
- **传输安全**：所有请求使用 HTTPS，携带 token 认证

---

## Git 与提交规范

### 提交消息格式
```
<type>: <subject>

<body>

<footer>
```

**type 示例**：
- `feat`: 新增功能
- `fix`: 修复 bug
- `refactor`: 重构代码
- `docs`: 更新文档
- `style`: 代码格式（eslint, prettier）
- `test`: 添加测试

**示例**：
```
feat: 添加志愿服务打卡功能

- 实现表单校验与积分限制逻辑
- 对接内容安全合规接口
- 引导用户订阅审核通知

Fixes #12
```

---

## 常见问题与故障排除

### 开发工具相关

**Q：更新依赖后 uView Plus 样式失效**  
A：运行 `npm run postinstall` 重新应用补丁脚本（见 `scripts/patch-uview-bind.cjs`）

**Q：微信开发者工具提示「未找到小程序框架」**  
A：
1. 确保全局编译已完成：`npm run build:mp-weixin`
2. 在微信开发者工具中刷新（Ctrl+R）
3. 检查 `dist/dev/mp-weixin/` 目录是否存在

**Q：打包后文件过大，超过 2MB 限制**  
A：
1. 运行 `npm run lint` 检查未使用的导入
2. 按需引入 uView Plus 组件
3. 检查是否有过大的静态资源

### 业务逻辑相关

**Q：表单校验规则如何扩展**  
A：在 `src/utils/rules.js` 中添加新规则，导出供页面使用

**Q：用户申报后如何通知**  
A：
1. 前端调用 `uni.requestSubscribeMessage()` 请求订阅
2. 管理员审核通过后，后端调用 `sendSubscribeMessage` 推送

**Q：如何添加新的志愿服务模块**  
A：
1. 在 AGENTS.md 的积分规则表中添加新条目
2. 在 `src/utils/rules.js` 中添加规则
3. 在 `src/pages/volunteer/` 中新增页面或子路由
4. 跟新积分说明文案与前端限制逻辑

---

## 资源与文档链接

- **详细需求规范**：[AGENTS.md](../AGENTS.md) - 完整的业务需求、技术栈、开发流程
- **项目需求**：[项目需求.md](../项目需求.md) - 功能清单与微信合规要求
- **后端接口**：[登录系统——后端对接.md](../登录系统——后端对接.md) - API 文档与部署指南
- **流程文档**：[Process.md](../Process.md) - 开发流程与协作规范

---

## 更新历史

- **2026-04-15**：初始化 AI 编程指南，整合 AGENTS.md 规范
