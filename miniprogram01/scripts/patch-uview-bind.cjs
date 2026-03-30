const fs = require('fs')
const path = require('path')

/**
 * 修复 uview-plus 在当前 uni 编译器下的模板兼容问题：
 * v-bind="对象" 在小程序编译阶段会报错，安装依赖后自动移除这几处写法。
 */
const patches = [
  {
    file: 'node_modules/uview-plus/components/u-picker/u-picker.vue',
    pattern: /^\s*v-bind="inputPropsInner"\s*$/gm
  },
  {
    file: 'node_modules/uview-plus/components/u-datetime-picker/u-datetime-picker.vue',
    pattern: /^\s*v-bind="inputPropsInner"\s*$/gm
  },
  {
    file: 'node_modules/uview-plus/components/u-pull-refresh/u-pull-refresh.vue',
    pattern: /^\s*v-bind="loadmoreProps"\s*$/gm
  }
]

const root = path.resolve(__dirname, '..')

const patchFile = ({ file, pattern }) => {
  const fullPath = path.resolve(root, file)
  if (!fs.existsSync(fullPath)) {
    console.log(`[uview-patch] skip missing: ${file}`)
    return
  }

  const original = fs.readFileSync(fullPath, 'utf8')
  const next = original.replace(pattern, '')

  if (next === original) {
    console.log(`[uview-patch] no change: ${file}`)
    return
  }

  fs.writeFileSync(fullPath, next, 'utf8')
  console.log(`[uview-patch] patched: ${file}`)
}

patches.forEach(patchFile)
