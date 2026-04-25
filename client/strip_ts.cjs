const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const srcDir = 'd:/MERN PROJECT/easyShop/easy-shop/src/components/ui';
const outDir = 'd:/MERN PROJECT/easyShop/client/src/components/ui';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.statSync(filePath).isFile()) return;
  
  const code = fs.readFileSync(filePath, 'utf8');
  try {
    const isTSX = file.endsWith('.tsx');
    const result = babel.transformSync(code, {
      filename: filePath,
      presets: [
        ['@babel/preset-typescript', { isTSX: isTSX, allExtensions: isTSX }]
      ]
    });
    const newExt = isTSX ? '.jsx' : '.js';
    const newFileName = file.replace(/\.tsx?$/, newExt);
    fs.writeFileSync(path.join(outDir, newFileName), result.code);
  } catch (e) {
    console.error('Error on ' + file + ':', e);
  }
});
