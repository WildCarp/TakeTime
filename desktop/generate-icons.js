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
  const sizes = [32, 128, 256];
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

  // ICO：先用 sharp 生成 256x256 的 PNG，再用 png-to-ico 生成标准 ICO 容器格式
  // （Tauri 能识别 png 后缀的伪 ico，但标准 ICO 容器在 Windows 资源管理器/任务栏渲染更可靠）
  const pngToIco = (await import('png-to-ico')).default;
  const png256 = path.join(iconsDir, '256x256.png');
  const icoBuffer = await pngToIco(png256);
  fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);

  console.log('Icons generated successfully!');
}

generate().catch(console.error);
