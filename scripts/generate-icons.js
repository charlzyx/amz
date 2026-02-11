const fs = require('fs');
const path = require('path');

// 创建简单的 SVG 图标
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#6366f1" rx="16"/>
  <text x="64" y="75" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">AMZ</text>
</svg>
`;

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'icon.svg');

// 写入 SVG
fs.writeFileSync(svgPath, svgIcon);

console.log('✅ SVG icon created at', svgPath);

// 注意：需要安装 sharp 包来转换 SVG 到 PNG
// 运行: npm install sharp
// 然后取消下面的注释

/*
const sharp = require('sharp');

[16, 48, 128].forEach(size => {
  const pngPath = path.join(publicDir, `icon${size}.png`);
  sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(pngPath)
    .then(() => console.log(`✅ Created ${pngPath}`))
    .catch(err => console.error(`❌ Error creating ${pngPath}:`, err));
});
*/

console.log('💡 Run `npm install sharp` and uncomment the code to generate PNG icons');
console.log('💡 Or use online SVG to PNG converter');
