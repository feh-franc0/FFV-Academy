/**
 * Gera os PNGs de ícone a partir de public/icon.svg usando sharp.
 *
 * Uso:
 *   node scripts/generate-icons.mjs
 *
 * Requer: npm install -D sharp
 */

import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('❌  sharp não instalado. Rode: npm install -D sharp');
  process.exit(1);
}

const svgPath = join(root, 'public', 'icon.svg');
const svgBuffer = readFileSync(svgPath);
const outDir = join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const icons = [
  { name: 'icon-32.png',          size: 32 },
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
  { name: 'apple-icon-180.png',   size: 180 },
];

// Maskable icon: adiciona padding de ~10% em cada lado (safe zone PWA)
const maskableSize = 512;
const padding = Math.round(maskableSize * 0.1);
const innerSize = maskableSize - padding * 2;

for (const { name, size } of icons) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(outDir, name));
  console.log(`✅  ${name} (${size}x${size})`);
}

// Maskable: fundo sólido + ícone com padding
await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: { r: 15, g: 23, b: 42, alpha: 1 }, // #0f172a
  },
})
  .composite([
    {
      input: await sharp(svgBuffer).resize(innerSize, innerSize).png().toBuffer(),
      top: padding,
      left: padding,
    },
  ])
  .png()
  .toFile(join(outDir, 'icon-maskable-512.png'));
console.log(`✅  icon-maskable-512.png (${maskableSize}x${maskableSize}, maskable)`);

console.log('\n🎉  Todos os ícones gerados em public/icons/');
console.log('   Próximo passo: adicione screenshots reais em public/icons/screenshot-wide.png e screenshot-mobile.png');
