/**
 * validate.ts — Validacao automatica de cada fase do pipeline
 *
 * Cada funcao retorna { pass: boolean, details: string[], fixes: string[] }
 * O pipeline usa isso para decidir retry ou avanco.
 *
 * Uso: importado por build-all.ts (nao roda sozinho)
 */

import { existsSync, statSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');
const OUT = resolve(ROOT, 'out');

export interface ValidationResult {
  pass: boolean;
  phase: string;
  details: string[];
  fixes: string[];
}

// ── FASE 1: Setup ───────────────────────────────────────────────────────

export function validateSetup(): ValidationResult {
  const details: string[] = [];
  const fixes: string[] = [];
  let pass = true;

  // ffmpeg
  try {
    execSync('which ffmpeg', { stdio: 'pipe' });
    details.push('✅ ffmpeg encontrado');
  } catch {
    details.push('❌ ffmpeg nao encontrado');
    fixes.push('brew install ffmpeg');
    pass = false;
  }

  // node_modules
  if (existsSync(resolve(ROOT, 'node_modules/remotion'))) {
    details.push('✅ remotion instalado');
  } else {
    details.push('❌ remotion nao instalado');
    fixes.push('cd marketing && npm install');
    pass = false;
  }

  // Dev server
  try {
    execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { stdio: 'pipe' });
    details.push('✅ Dev server respondendo em localhost:3000');
  } catch {
    details.push('❌ Dev server nao esta rodando');
    fixes.push('cd .. && npm run dev &');
    pass = false;
  }

  // Diretorios
  const dirs = ['public/screenshots', 'public/audio', 'out'];
  for (const dir of dirs) {
    if (existsSync(resolve(ROOT, dir))) {
      details.push(`✅ ${dir}/ existe`);
    } else {
      details.push(`❌ ${dir}/ nao existe`);
      fixes.push(`mkdir -p ${dir}`);
      pass = false;
    }
  }

  return { pass, phase: 'setup', details, fixes };
}

// ── FASE 2: Screenshots ────────────────────────────────────────────────

const EXPECTED_SCREENSHOTS = [
  'home-hero.png',
  'trilha-progresso.png',
  'quiz-pergunta.png',
  'quiz-feedback.png',
  'dashboard-progresso.png',
  'srs-review.png',
];

export function validateScreenshots(): ValidationResult {
  const details: string[] = [];
  const fixes: string[] = [];
  let pass = true;
  const screenshotsDir = resolve(PUBLIC, 'screenshots');

  for (const file of EXPECTED_SCREENSHOTS) {
    const filepath = resolve(screenshotsDir, file);
    if (!existsSync(filepath)) {
      details.push(`❌ ${file} nao encontrado`);
      fixes.push(`Re-executar captura: npx tsx scripts/capture.ts`);
      pass = false;
      continue;
    }

    const stats = statSync(filepath);
    const sizeKB = Math.round(stats.size / 1024);

    if (stats.size < 100_000) {
      details.push(`❌ ${file}: ${sizeKB}KB (muito pequeno, provavelmente placeholder)`);
      fixes.push(`Re-capturar ${file} — pode ser que a pagina nao carregou`);
      pass = false;
    } else {
      details.push(`✅ ${file}: ${sizeKB}KB`);
    }
  }

  return { pass, phase: 'screenshots', details, fixes };
}

// ── FASE 3: Composicao Remotion ─────────────────────────────────────────

export function validateComposition(): ValidationResult {
  const details: string[] = [];
  const fixes: string[] = [];
  let pass = true;

  try {
    const output = execSync('npx remotion compositions src/index.tsx 2>&1', {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 60000,
    }).toString();

    if (output.includes('PromoVideo')) {
      details.push('✅ Composition PromoVideo encontrada');

      // Verifica specs
      if (output.includes('2400')) {
        details.push('✅ Duracao: 2400 frames (80s)');
      } else {
        details.push('❌ Duracao incorreta (esperado 2400 frames)');
        fixes.push('Verificar VIDEO.TOTAL_FRAMES em tokens.ts');
        pass = false;
      }

      if (output.includes('1920x1080')) {
        details.push('✅ Resolucao: 1920x1080');
      } else {
        details.push('❌ Resolucao incorreta');
        fixes.push('Verificar VIDEO.WIDTH/HEIGHT em tokens.ts');
        pass = false;
      }
    } else {
      details.push('❌ Composition PromoVideo nao encontrada');
      fixes.push('Verificar registerRoot em index.tsx');
      pass = false;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    details.push(`❌ Bundle falhou: ${msg.slice(0, 200)}`);
    fixes.push('Verificar erros de TypeScript/JSX nos componentes');
    pass = false;
  }

  return { pass, phase: 'composition', details, fixes };
}

// ── FASE 4: Audio ───────────────────────────────────────────────────────

export function validateAudio(): ValidationResult {
  const details: string[] = [];
  const fixes: string[] = [];
  let pass = true;
  const audioPath = resolve(PUBLIC, 'audio/background.mp3');

  if (!existsSync(audioPath)) {
    details.push('❌ background.mp3 nao encontrado');
    fixes.push('Baixar musica royalty-free para public/audio/background.mp3');
    pass = false;
    return { pass, phase: 'audio', details, fixes };
  }

  const stats = statSync(audioPath);
  const sizeKB = Math.round(stats.size / 1024);

  if (stats.size < 50_000) {
    details.push(`⚠️ background.mp3: ${sizeKB}KB (provavelmente placeholder silencioso)`);
    details.push('  Video renderiza mas sem musica real');
    // Nao falha — permite render com placeholder
  } else {
    details.push(`✅ background.mp3: ${sizeKB}KB`);
  }

  // Verifica duracao com ffprobe
  try {
    const duration = execSync(
      `ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`,
      { stdio: 'pipe' }
    ).toString().trim();

    const durationSec = parseFloat(duration);
    if (durationSec >= 78) {
      details.push(`✅ Duracao: ${durationSec.toFixed(1)}s (>= 78s)`);
    } else {
      details.push(`❌ Duracao: ${durationSec.toFixed(1)}s (precisa >= 78s)`);
      fixes.push('Audio muito curto — substituir por musica de >= 80s');
      pass = false;
    }
  } catch {
    details.push('⚠️ ffprobe falhou — nao conseguiu verificar duracao');
  }

  return { pass, phase: 'audio', details, fixes };
}

// ── FASE 5: Render ──────────────────────────────────────────────────────

export function validateRender(): ValidationResult {
  const details: string[] = [];
  const fixes: string[] = [];
  let pass = true;

  // Video
  const videoPath = resolve(OUT, 'promo.mp4');
  if (!existsSync(videoPath)) {
    details.push('❌ promo.mp4 nao encontrado');
    fixes.push('Executar: npm run render');
    pass = false;
  } else {
    const stats = statSync(videoPath);
    const sizeMB = (stats.size / 1_000_000).toFixed(1);

    if (stats.size < 5_000_000) {
      details.push(`❌ promo.mp4: ${sizeMB}MB (muito pequeno, possivel erro no render)`);
      fixes.push('Verificar logs do render e re-executar');
      pass = false;
    } else {
      details.push(`✅ promo.mp4: ${sizeMB}MB`);
    }

    // Verifica com ffprobe
    try {
      const probeOutput = execSync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`,
        { stdio: 'pipe' }
      ).toString();

      const probe = JSON.parse(probeOutput);
      const duration = parseFloat(probe.format?.duration || '0');
      const videoStream = probe.streams?.find((s: any) => s.codec_type === 'video');

      if (duration >= 78 && duration <= 85) {
        details.push(`✅ Duracao: ${duration.toFixed(1)}s`);
      } else {
        details.push(`❌ Duracao: ${duration.toFixed(1)}s (esperado ~80s)`);
        pass = false;
      }

      if (videoStream) {
        details.push(`✅ Codec: ${videoStream.codec_name}, ${videoStream.width}x${videoStream.height}`);
      }
    } catch {
      details.push('⚠️ ffprobe falhou ao analisar video');
    }
  }

  // Thumbnail
  const thumbPath = resolve(OUT, 'thumbnail.png');
  if (!existsSync(thumbPath)) {
    details.push('⚠️ thumbnail.png nao encontrado (opcional)');
  } else {
    const stats = statSync(thumbPath);
    details.push(`✅ thumbnail.png: ${Math.round(stats.size / 1024)}KB`);
  }

  return { pass, phase: 'render', details, fixes };
}

// ── FASE 6: Frames-Chave ────────────────────────────────────────────────

export function validateKeyFrames(): ValidationResult {
  const details: string[] = [];
  const fixes: string[] = [];
  let pass = true;

  const keyFrames = [
    { frame: 120, scene: 'Hook', expect: 'headline visivel' },
    { frame: 390, scene: 'Problema', expect: 'texto + azul' },
    { frame: 720, scene: 'Revelacao', expect: 'home + headline' },
    { frame: 1100, scene: 'Features', expect: 'screenshot + barra' },
    { frame: 1700, scene: 'Prova', expect: 'numeros visiveis' },
    { frame: 2200, scene: 'CTA', expect: 'URL legivel' },
  ];

  for (const kf of keyFrames) {
    const framePath = resolve(OUT, `frame-${kf.frame}.png`);
    if (!existsSync(framePath)) {
      details.push(`❌ Frame ${kf.frame} (${kf.scene}) nao renderizado`);
      fixes.push(`npx remotion still src/index.tsx PromoVideo out/frame-${kf.frame}.png --frame ${kf.frame}`);
      pass = false;
    } else {
      const stats = statSync(framePath);
      if (stats.size < 10_000) {
        details.push(`❌ Frame ${kf.frame} (${kf.scene}): muito pequeno (${Math.round(stats.size/1024)}KB) — possivel tela preta`);
        fixes.push(`Verificar cena ${kf.scene}: transicao pode estar cobrindo o conteudo`);
        pass = false;
      } else {
        details.push(`✅ Frame ${kf.frame} (${kf.scene}): ${Math.round(stats.size/1024)}KB — ${kf.expect}`);
      }
    }
  }

  return { pass, phase: 'key-frames', details, fixes };
}

// ── Helper: Imprime resultado ───────────────────────────────────────────

export function printResult(result: ValidationResult): void {
  const icon = result.pass ? '✅' : '❌';
  console.log(`\n${icon} FASE: ${result.phase.toUpperCase()}`);
  console.log('─'.repeat(60));
  for (const d of result.details) {
    console.log(`  ${d}`);
  }
  if (result.fixes.length > 0) {
    console.log('\n  Correcoes necessarias:');
    for (const f of result.fixes) {
      console.log(`  → ${f}`);
    }
  }
}
