const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * 将 SVG 文件转换为 PNG 格式
 * 用于 uni-app 微信小程序 tabBar 图标
 */

const svgFiles = [
  { input: 'home.svg', output: 'home.png' },
  { input: 'home-active.svg', output: 'home-active.png' },
  { input: 'mine.svg', output: 'mine.png' },
  { input: 'mine-active.svg', output: 'mine-active.png' }
];

const inputDir = path.join(__dirname, '../static/tabbar');
const outputDir = path.join(__dirname, '../static/tabbar');

console.log('SVG to PNG 转换工具');
console.log('==================');
console.log('');

async function convertSvgToPng() {
  try {
    for (const file of svgFiles) {
      const svgPath = path.join(inputDir, file.input);
      const pngPath = path.join(outputDir, file.output);
      
      if (!fs.existsSync(svgPath)) {
        console.log(`✗ 未找到：${file.input}`);
        continue;
      }
      
      await sharp(svgPath)
        .resize(81, 81)
        .png()
        .toFile(pngPath);
      
      console.log(`✓ 已转换：${file.input} → ${file.output}`);
    }
    
    console.log('');
    console.log('转换完成！PNG 文件已保存到 static/tabbar/ 目录');
    console.log('');
    console.log('下一步：');
    console.log('  1. 验证 PNG 文件是否正确生成');
    console.log('  2. 运行 npm run dev:mp-weixin 重新编译');
    console.log('  3. 在微信开发者工具中查看效果');
  } catch (error) {
    console.error('转换失败:', error.message);
  }
}

convertSvgToPng();
