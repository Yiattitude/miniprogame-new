const fs = require('fs');
const path = require('path');

/**
 * 生成简单的 PNG 图标
 * 使用基础的 PNG 格式，不依赖外部库
 */

// CRC32 表
const crcTable = [];
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPNG(filePath, r, g, b) {
  const size = 81;
  const rawData = [];
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = 30;   // 外圆半径
  const innerRadius = 14;   // 内圆半径
  const toothCount = 6;     // 齿轮齿数
  const toothHeight = 8;    // 齿的高度
  const toothWidth = 0.3;   // 齿的宽度（弧度）
  const lineWidth = 3;      // 线条宽度（与 home/mine 图标一致）
  
  // 创建图像数据（带 Alpha 通道）
  for (let y = 0; y < size; y++) {
    rawData.push(0); // 每行开始的 filter byte
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI;
      
      // 判断是否在齿的位置
      let inTooth = false;
      for (let i = 0; i < toothCount; i++) {
        const toothCenterAngle = (i * 2 * Math.PI) / toothCount;
        const angleDiff = Math.abs(angle - toothCenterAngle);
        const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
        
        if (normalizedDiff <= toothWidth / 2) {
          inTooth = true;
          break;
        }
      }
      
      // 线条风格：只绘制轮廓
      let alpha = 0;
      
      // 外圆轮廓（包括齿）
      if (inTooth) {
        // 齿的外边缘
        const outerEdge = outerRadius + toothHeight;
        const distToOuter = Math.abs(dist - outerEdge);
        if (distToOuter <= lineWidth / 2) {
          alpha = 255;
        }
        // 齿的侧边
        else if (dist <= outerEdge && dist >= outerRadius) {
          for (let i = 0; i < toothCount; i++) {
            const toothAngle = (i * 2 * Math.PI) / toothCount;
            const angleDiff = Math.abs(angle - toothAngle);
            const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
            if (normalizedDiff <= toothWidth / 2 + 0.05 && normalizedDiff >= toothWidth / 2 - 0.05) {
              alpha = 255;
              break;
            }
          }
        }
      } else {
        // 外圆轮廓
        const distToOuter = Math.abs(dist - outerRadius);
        if (distToOuter <= lineWidth / 2) {
          alpha = 255;
        }
        // 内圆轮廓
        const distToInner = Math.abs(dist - innerRadius);
        if (distToInner <= lineWidth / 2) {
          alpha = 255;
        }
      }
      
      rawData.push(r);
      rawData.push(g);
      rawData.push(b);
      rawData.push(alpha);
    }
  }
  
  // 压缩数据
  const zlib = require('zlib');
  const inputData = Buffer.from(rawData);
  const compressed = zlib.deflateSync(inputData, { level: 9 });
  
  // 构建 PNG 文件
  const chunks = [];
  
  // PNG 签名
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = crc32(Buffer.concat([ihdrType, ihdrData]));
  const ihdrChunk = Buffer.alloc(4 + 4 + 13 + 4);
  ihdrChunk.writeUInt32BE(13, 0);
  ihdrType.copy(ihdrChunk, 4);
  ihdrData.copy(ihdrChunk, 8);
  ihdrChunk.writeUInt32BE(ihdrCrc, 21);
  chunks.push(ihdrChunk);
  
  // IDAT chunk
  const idatType = Buffer.from('IDAT');
  const idatCrc = crc32(Buffer.concat([idatType, compressed]));
  const idatChunk = Buffer.alloc(4 + 4 + compressed.length + 4);
  idatChunk.writeUInt32BE(compressed.length, 0);
  idatType.copy(idatChunk, 4);
  compressed.copy(idatChunk, 8);
  idatChunk.writeUInt32BE(idatCrc, 8 + compressed.length);
  chunks.push(idatChunk);
  
  // IEND chunk
  const iendType = Buffer.from('IEND');
  const iendCrc = crc32(iendType);
  const iendChunk = Buffer.alloc(4 + 4 + 4);
  iendChunk.writeUInt32BE(0, 0);
  iendType.copy(iendChunk, 4);
  iendChunk.writeUInt32BE(iendCrc, 8);
  chunks.push(iendChunk);
  
  // 写入文件
  const pngBuffer = Buffer.concat(chunks);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Created: ${filePath} (${r}, ${g}, ${b})`);
}

// 创建图标
const tabbarDir = path.join(__dirname, '..', 'src', 'static', 'tabbar');

// 灰色图标（未选中）
createPNG(path.join(tabbarDir, 'admin.png'), 140, 140, 140);

// 橙色图标（选中）
createPNG(path.join(tabbarDir, 'admin-active.png'), 194, 65, 12);

console.log('管理员图标创建完成！');
