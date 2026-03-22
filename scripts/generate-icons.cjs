const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Android 图标尺寸
const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Adaptive Icon 需要的尺寸 (108dp 基础)
const adaptiveSizes = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432
};

const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const svgPath = path.join(__dirname, '..', 'public', 'PhysFlow.svg');

// 背景颜色
const backgroundColor = '#0f0f1a';

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const [folder, size] of Object.entries(sizes)) {
    const adaptiveSize = adaptiveSizes[folder];
    // 安全区域 = 66.67% (72/108)
    const safeSize = Math.floor(adaptiveSize * 0.667);
    const padding = Math.floor((adaptiveSize - safeSize) / 2);

    // 1. 传统图标 (直接 resize)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(androidResPath, folder, 'ic_launcher.png'));

    // 2. 圆角图标
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(androidResPath, folder, 'ic_launcher_round.png'));

    // 3. 前景层 (Adaptive Icon) - 带出血线
    // 先创建一个小尺寸的 logo，然后居中放到大画布上
    const logoBuffer = await sharp(svgBuffer)
      .resize(safeSize, safeSize)
      .png()
      .toBuffer();

    // 创建前景层画布
    await sharp({
      create: {
        width: adaptiveSize,
        height: adaptiveSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // 透明背景
      }
    })
    .composite([{
      input: logoBuffer,
      left: padding,
      top: padding
    }])
    .png()
    .toFile(path.join(androidResPath, folder, 'ic_launcher_foreground.png'));

    console.log(`Generated ${folder}: ${size}x${size} (foreground: ${adaptiveSize}x${adaptiveSize})`);
  }

  console.log('All icons generated!');
}

generateIcons().catch(console.error);
