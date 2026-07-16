const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// 脚本位置：<repo>/desktop/generate-icons.js
// 使用仓库内置的图标源（纯色版），不依赖网页版先构建，做到图标自给自足。
const svgPath = path.resolve(__dirname, 'src-tauri/icons/icon-source.svg');
const iconsDir = path.resolve(__dirname, 'src-tauri/icons');

async function generate() {
  if (!fs.existsSync(svgPath)) {
    throw new Error(`图标源不存在: ${svgPath}`);
  }
  const svgBuffer = fs.readFileSync(svgPath);

  // 生成各尺寸 PNG（文件名需与 tauri.conf.json 的 icon 列表一致：${size}x${size}.png）
  const sizes = [16, 32, 128, 256];
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `${size}x${size}.png`));
  }

  // 128x128@2x
  await sharp(svgBuffer)
    .resize(256, 256)
    .png()
    .toFile(path.join(iconsDir, '128x128@2x.png'));

  // ICO：包含多个尺寸（16/32/128/256），系统托盘使用 16x16，任务栏/资源管理器使用更大尺寸
  const pngToIco = (await import('png-to-ico')).default;
  const icoInputs = [16, 32, 128, 256].map(s => path.join(iconsDir, `${s}x${s}.png`));
  const icoBuffer = await pngToIco(icoInputs);
  fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);

  console.log('Icons generated successfully!');
}

generate().catch(console.error);
