/**
 * render-shorts.ts — Renderiza as 4 variantes do Hero comercial
 *
 * Uso:
 *   npx tsx scripts/render-shorts.ts --id=Hero-H-Phone
 *   npx tsx scripts/render-shorts.ts --all
 */

import { execSync } from 'child_process';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ENTRY = join(ROOT, 'src/short/index.tsx');
const OUT_DIR = join(ROOT, 'out');

const VARIANTS: { id: string; output: string }[] = [
  // Sem texto (4)
  { id: 'Hero-H-Phone',         output: 'hero-horizontal-phone.mp4' },
  { id: 'Hero-H-Computer',      output: 'hero-horizontal-computer.mp4' },
  { id: 'Hero-V-Phone',         output: 'hero-vertical-phone.mp4' },
  { id: 'Hero-V-Computer',      output: 'hero-vertical-computer.mp4' },
  // Com texto (4)
  { id: 'Hero-H-Phone-Text',    output: 'hero-horizontal-phone-text.mp4' },
  { id: 'Hero-H-Computer-Text', output: 'hero-horizontal-computer-text.mp4' },
  { id: 'Hero-V-Phone-Text',    output: 'hero-vertical-phone-text.mp4' },
  { id: 'Hero-V-Computer-Text', output: 'hero-vertical-computer-text.mp4' },
];

function renderOne(id: string, output: string): void {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, output);
  console.log(`\n🎬 Renderizando ${id} → ${outPath}`);
  execSync(
    `npx remotion render "${ENTRY}" ${id} "${outPath}" --codec h264 --crf 20`,
    { cwd: ROOT, stdio: 'inherit' }
  );
  console.log(`✓ ${outPath}`);
}

function main() {
  const all = process.argv.includes('--all');
  const idArg = process.argv.find(a => a.startsWith('--id='))?.split('=')[1];

  if (all) {
    for (const { id, output } of VARIANTS) renderOne(id, output);
    return;
  }
  if (!idArg) {
    console.error('❌ Uso: --id=Hero-H-Phone|Hero-H-Computer|Hero-V-Phone|Hero-V-Computer (ou --all)');
    process.exit(1);
  }
  const target = VARIANTS.find(v => v.id === idArg);
  if (!target) {
    console.error(`❌ id invalido: ${idArg}`);
    process.exit(1);
  }
  renderOne(target.id, target.output);
}

main();
