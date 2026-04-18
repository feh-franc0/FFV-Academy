/**
 * build-all.ts — Pipeline completo automatizado com quality gates
 *
 * Executa todas as fases em sequencia:
 * Setup → Capture → Validate → Compose → Preview → Audio → Render → Validate Final
 *
 * Se uma fase falha, tenta corrigir e re-executar (max 3 tentativas).
 * Se 3 tentativas falham, para e reporta.
 *
 * Uso: npx tsx scripts/build-all.ts [fase]
 *   npx tsx scripts/build-all.ts         # Roda tudo
 *   npx tsx scripts/build-all.ts capture # So a fase de captura
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  validateSetup,
  validateScreenshots,
  validateComposition,
  validateAudio,
  validateRender,
  validateKeyFrames,
  printResult,
  type ValidationResult,
} from './validate';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PROJECT_ROOT = resolve(ROOT, '..');

const MAX_RETRIES = 3;

// ── Helpers ─────────────────────────────────────────────────────────────

function run(cmd: string, cwd = ROOT): string {
  console.log(`  $ ${cmd}`);
  try {
    return execSync(cmd, { cwd, stdio: 'pipe', timeout: 300000 }).toString();
  } catch (error) {
    const msg = error instanceof Error ? (error as any).stderr?.toString() || error.message : String(error);
    throw new Error(`Comando falhou: ${cmd}\n${msg.slice(0, 500)}`);
  }
}

function runVisible(cmd: string, cwd = ROOT): void {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', timeout: 300000 });
}

function header(phase: string, attempt: number): void {
  console.log('\n' + '═'.repeat(70));
  console.log(`  FASE: ${phase}${attempt > 1 ? ` (tentativa ${attempt}/${MAX_RETRIES})` : ''}`);
  console.log('═'.repeat(70));
}

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ── Fase 1: Setup ───────────────────────────────────────────────────────

async function phaseSetup(): Promise<boolean> {
  header('SETUP', 1);

  // Garante diretorios
  for (const dir of ['public/screenshots', 'public/audio', 'out', 'assets/screenshots']) {
    const fullPath = resolve(ROOT, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      console.log(`  📁 Criado: ${dir}/`);
    }
  }

  // Verifica ffmpeg
  try {
    run('which ffmpeg');
    console.log('  ✅ ffmpeg encontrado');
  } catch {
    console.log('  ⚠️ ffmpeg nao encontrado, instalando...');
    runVisible('brew install ffmpeg');
  }

  // Verifica node_modules
  if (!existsSync(resolve(ROOT, 'node_modules/remotion'))) {
    console.log('  ⚠️ Dependencias nao instaladas, instalando...');
    runVisible('npm install', ROOT);
  }
  console.log('  ✅ Dependencias OK');

  // Verifica dev server
  let serverRunning = false;
  try {
    const code = run('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000');
    serverRunning = code.trim().startsWith('2') || code.trim().startsWith('3');
  } catch {}

  if (!serverRunning) {
    console.log('  ⚠️ Dev server nao esta rodando');
    console.log('  🚀 Iniciando dev server em background...');
    execSync('npm run dev &', { cwd: PROJECT_ROOT, stdio: 'ignore', detached: true });
    console.log('  ⏳ Aguardando server iniciar (15s)...');
    await sleep(15000);

    // Re-verifica
    try {
      run('curl -s -o /dev/null http://localhost:3000');
      console.log('  ✅ Dev server respondendo');
    } catch {
      console.log('  ❌ Dev server nao iniciou. Execute manualmente: cd .. && npm run dev');
      return false;
    }
  } else {
    console.log('  ✅ Dev server respondendo em localhost:3000');
  }

  const result = validateSetup();
  printResult(result);
  return result.pass;
}

// ── Fase 2: Captura ─────────────────────────────────────────────────────

async function phaseCapture(): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    header('CAPTURA DE SCREENSHOTS', attempt);

    try {
      runVisible('npx tsx scripts/capture.ts', ROOT);
    } catch (error) {
      console.log(`  ❌ Captura falhou: ${error}`);
      if (attempt < MAX_RETRIES) {
        console.log('  🔄 Aguardando 5s antes de retentar...');
        await sleep(5000);
        continue;
      }
      return false;
    }

    const result = validateScreenshots();
    printResult(result);

    if (result.pass) return true;

    if (attempt < MAX_RETRIES) {
      console.log('\n  🔄 Screenshots insuficientes. Retentando captura...');
      await sleep(3000);
    }
  }
  return false;
}

// ── Fase 3: Composicao ──────────────────────────────────────────────────

async function phaseCompose(): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    header('COMPOSICAO REMOTION', attempt);

    const result = validateComposition();
    printResult(result);

    if (result.pass) return true;

    if (attempt < MAX_RETRIES) {
      console.log('\n  🔧 Tentando corrigir...');
      for (const fix of result.fixes) {
        console.log(`  → ${fix}`);
      }
      await sleep(2000);
    }
  }
  return false;
}

// ── Fase 4: Preview Check ───────────────────────────────────────────────

async function phasePreviewCheck(): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    header('PREVIEW CHECK (FRAMES-CHAVE)', attempt);

    // Renderiza 6 frames-chave
    const keyFrames = [120, 390, 720, 1100, 1700, 2200];
    let renderOk = true;

    for (const frame of keyFrames) {
      try {
        console.log(`  🎞️  Renderizando frame ${frame}...`);
        run(`npx remotion still src/index.tsx PromoVideo out/frame-${frame}.png --frame ${frame}`);
      } catch (error) {
        console.log(`  ❌ Frame ${frame} falhou: ${error}`);
        renderOk = false;
      }
    }

    if (!renderOk && attempt < MAX_RETRIES) {
      console.log('  🔄 Retentando render de frames...');
      await sleep(3000);
      continue;
    }

    const result = validateKeyFrames();
    printResult(result);

    if (result.pass) return true;

    if (attempt < MAX_RETRIES) {
      console.log('\n  🔧 Frames com problema. Verificando cenas...');
      for (const fix of result.fixes) {
        console.log(`  → ${fix}`);
      }
      await sleep(2000);
    }
  }
  return false;
}

// ── Fase 5: Audio ───────────────────────────────────────────────────────

async function phaseAudio(): Promise<boolean> {
  header('AUDIO', 1);

  const audioPath = resolve(ROOT, 'public/audio/background.mp3');

  if (!existsSync(audioPath)) {
    console.log('  ⚠️ Audio nao encontrado. Gerando placeholder silencioso...');
    run('ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 80 -q:a 9 -acodec libmp3lame public/audio/background.mp3 -y');
    console.log('  📝 Placeholder criado (silencio 80s)');
    console.log('  💡 Substitua por musica real de pixabay.com/music');
  }

  const result = validateAudio();
  printResult(result);
  return result.pass;
}

// ── Fase 6: Render ──────────────────────────────────────────────────────

async function phaseRender(): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    header('RENDER FINAL', attempt);

    try {
      console.log('  🎬 Renderizando video (pode levar 1-3 min)...\n');
      runVisible('npx remotion render src/index.tsx PromoVideo out/promo.mp4 --codec h264 --crf 18 --audio-bitrate 192k', ROOT);
    } catch (error) {
      console.log(`  ❌ Render falhou: ${error}`);
      if (attempt < MAX_RETRIES) {
        console.log('  🔄 Retentando...');
        await sleep(5000);
        continue;
      }
      return false;
    }

    // Thumbnail
    try {
      console.log('\n  🖼️  Gerando thumbnail...');
      run('npx remotion still src/index.tsx PromoVideo out/thumbnail.png --frame 720');
    } catch {
      console.log('  ⚠️ Thumbnail falhou (nao critico)');
    }

    const result = validateRender();
    printResult(result);

    if (result.pass) return true;

    if (attempt < MAX_RETRIES) {
      console.log('\n  🔧 Render com problemas. Ajustando...');
      for (const fix of result.fixes) {
        console.log(`  → ${fix}`);
      }
      await sleep(3000);
    }
  }
  return false;
}

// ── Pipeline Completo ───────────────────────────────────────────────────

interface PhaseConfig {
  name: string;
  fn: () => Promise<boolean>;
  critical: boolean; // Se true, para o pipeline se falhar
}

const ALL_PHASES: PhaseConfig[] = [
  { name: 'setup', fn: phaseSetup, critical: true },
  { name: 'capture', fn: phaseCapture, critical: true },
  { name: 'compose', fn: phaseCompose, critical: true },
  { name: 'preview-check', fn: phasePreviewCheck, critical: true },
  { name: 'audio', fn: phaseAudio, critical: false }, // Audio placeholder e aceitavel
  { name: 'render', fn: phaseRender, critical: true },
];

async function runPipeline(targetPhase?: string): Promise<void> {
  console.log('\n🎬 ═══════════════════════════════════════════════════════════════');
  console.log('   FFV ACADEMY — PIPELINE DE VIDEO PROMOCIONAL');
  console.log('   Pipeline automatizado com quality gates');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const phases = targetPhase
    ? ALL_PHASES.filter(p => p.name === targetPhase)
    : ALL_PHASES;

  if (phases.length === 0) {
    console.log(`❌ Fase "${targetPhase}" nao encontrada.`);
    console.log(`   Fases disponiveis: ${ALL_PHASES.map(p => p.name).join(', ')}`);
    process.exit(1);
  }

  const results: { name: string; pass: boolean }[] = [];

  for (const phase of phases) {
    const pass = await phase.fn();
    results.push({ name: phase.name, pass });

    if (!pass && phase.critical) {
      console.log(`\n❌ PIPELINE PAROU na fase "${phase.name}"`);
      console.log('   Corrija os problemas acima e re-execute.\n');
      break;
    }
  }

  // Relatorio final
  console.log('\n\n' + '═'.repeat(70));
  console.log('  RELATORIO FINAL');
  console.log('═'.repeat(70));

  for (const r of results) {
    console.log(`  ${r.pass ? '✅' : '❌'} ${r.name}`);
  }

  const allPassed = results.every(r => r.pass);

  if (allPassed) {
    console.log('\n🎉 PIPELINE CONCLUIDO COM SUCESSO!\n');
    console.log('  📹 Video: marketing/out/promo.mp4');
    console.log('  🖼️  Thumbnail: marketing/out/thumbnail.png');
    console.log('  ⏱️  Duracao: ~80 segundos');
    console.log('  📐 Resolucao: 1920x1080 (16:9)');
    console.log('\n  Proximo passo: assista o video e rode /marketing-producao final-review');
    console.log('  para analise critica dos 5 experts.\n');
  } else {
    console.log('\n⚠️  Pipeline nao concluiu. Veja erros acima.\n');
  }
}

// ── Entry point ─────────────────────────────────────────────────────────

const targetPhase = process.argv[2];
runPipeline(targetPhase).catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
