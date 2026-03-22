const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const svgPath = path.join(__dirname, '..', 'public', 'PhysFlow.svg');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const [folder, size] of Object.entries(sizes)) {
    const outputPath = path.join(androidResPath, folder, 'ic_launcher.png');
    const outputRoundPath = path.join(androidResPath, folder, 'ic_launcher_round.png');
    const outputForegroundPath = path.join(androidResPath, folder, 'ic_launcher_foreground.png');

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputRoundPath);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputForegroundPath);

    console.log(`Generated ${folder}/ic_launcher.png (${size}x${size})`);
  }

  console.log('All icons generated!');
}

generateIcons().catch(console.error);
