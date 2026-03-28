const fs = require('fs')
const path = require('path')

/**
 * 清理 uni-app 微信小程序编译产物，避免开发模式下残留旧组件映射。
 * 用法：
 * node scripts/clean-mp-output.cjs dev mp-weixin
 * node scripts/clean-mp-output.cjs build mp-weixin
 */
const [, , outputType = 'dev', platform = 'mp-weixin'] = process.argv
const targetDir = path.resolve(__dirname, '..', 'dist', outputType, platform)

/** 删除目标目录下的旧产物，避免直接删除目录时被外部进程锁住。 */
const cleanOutput = () => {
  if (!fs.existsSync(targetDir)) {
    console.log(`[clean] skip: ${targetDir}`)
    return
  }

  const entries = fs.readdirSync(targetDir)
  const failedEntries = []

  entries.forEach((entry) => {
    const entryPath = path.join(targetDir, entry)

    try {
      fs.rmSync(entryPath, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 200
      })
    } catch (error) {
      failedEntries.push(entryPath)
    }
  })

  if (failedEntries.length > 0) {
    console.error(`[clean] failed: ${targetDir}`)
    failedEntries.forEach((entryPath) => {
      console.error(`[clean] busy: ${entryPath}`)
    })
    console.error('[clean] 请先关闭微信开发者工具或占用该目录的调试进程，再重新执行当前命令。')
    process.exit(1)
  }

  console.log(`[clean] cleared: ${targetDir}`)
}

cleanOutput()
