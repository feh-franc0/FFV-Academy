/**
 * record-beats.ts — Gravacao real de tela com Playwright para o Hero comercial
 *
 * Grava 12 beats em 2 viewports:
 *   phone:    412x915  → beats/hero-phone/
 *   computer: 1920x1080 → beats/hero-computer/
 *
 * Pre-requisitos:
 *   1. Build estatico rodando: `cd .. && npm run build && npx serve out -p 8080`
 *   2. Playwright instalado: `npm install && npx playwright install chromium`
 *
 * Uso:
 *   npx tsx scripts/record-beats.ts --device=phone
 *   npx tsx scripts/record-beats.ts --device=computer
 *   npx tsx scripts/record-beats.ts --all
 */

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { existsSync, mkdirSync, renameSync, writeFileSync, readdirSync, readFileSync, rmSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { GAME_STATE_FULL, GAME_STATE_EMPTY, buildInitScript, wait } from './shared/state';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BEATS_ROOT = resolve(__dirname, '../public/beats');
const BASE_URL = process.env.RECORD_URL || 'http://127.0.0.1:8080';

type DeviceKind = 'phone' | 'computer';

const VIEWPORTS: Record<DeviceKind, { width: number; height: number }> = {
  phone:    { width: 412, height: 915 },
  computer: { width: 1920, height: 1080 },
};

interface ClickMark { time: number; x: number; y: number; }

interface Beat {
  id: string;
  description: string;
  url: string;
  state: Record<string, unknown>;
  theme?: 'dark' | 'light';
  durationMs: number;
  run: (page: Page, marks: ClickMark[]) => Promise<void>;
}

interface BeatManifest {
  id: string;
  durationSec: number;
  width: number;
  height: number;
  clicks: ClickMark[];
}

// ── Helpers ─────────────────────────────────────────────────────────────

async function markClickByText(page: Page, marks: ClickMark[], startMs: number, text: string): Promise<boolean> {
  const box = await page.evaluate((txt: string) => {
    const all = Array.from(document.querySelectorAll('button, a, [role="button"]')) as HTMLElement[];
    const el = all.find(e => e.textContent?.includes(txt));
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: window.innerWidth, h: window.innerHeight };
  }, text);
  if (!box) return false;
  marks.push({
    time: (Date.now() - startMs) / 1000,
    x: box.x / box.w,
    y: box.y / box.h,
  });
  await page.mouse.click(box.x, box.y);
  return true;
}

async function smoothScroll(page: Page, toY: number, steps = 25): Promise<void> {
  const currentY = await page.evaluate(() => window.scrollY);
  const delta = (toY - currentY) / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy({ top: d, behavior: 'instant' as ScrollBehavior }), delta);
    await wait(30);
  }
}

// ── 12 beats do Hero (identicos pra ambos devices; viewport muda a aparencia) ──

const HERO_BEATS: Beat[] = [
  { id: 'h-01-hook', description: 'Home (hook)', url: `${BASE_URL}/`, state: GAME_STATE_FULL, durationMs: 4000,
    run: async (p) => { await p.waitForLoadState('networkidle'); await wait(3500); } },

  { id: 'h-02-pain', description: 'Home scroll (pain/panoramica)', url: `${BASE_URL}/`, state: GAME_STATE_FULL, durationMs: 5000,
    run: async (p) => { await p.waitForLoadState('networkidle'); await wait(800); await smoothScroll(p, 2200, 45); await wait(500); } },

  { id: 'h-03-reveal', description: 'Home hero estavel (reveal background)', url: `${BASE_URL}/`, state: GAME_STATE_FULL, durationMs: 5000,
    run: async (p) => { await p.waitForLoadState('networkidle'); await wait(4500); } },

  { id: 'h-04-hub-ia', description: 'Hub IA', url: `${BASE_URL}/ia`, state: GAME_STATE_FULL, durationMs: 4500,
    run: async (p) => { await p.waitForLoadState('networkidle'); await wait(1200); await smoothScroll(p, 400, 20); await wait(2000); } },

  { id: 'h-05-hub-aws', description: 'Hub AWS', url: `${BASE_URL}/aws`, state: GAME_STATE_FULL, durationMs: 4500,
    run: async (p) => { await p.waitForLoadState('networkidle'); await wait(1200); await smoothScroll(p, 400, 20); await wait(2000); } },

  { id: 'h-06-hub-eng', description: 'Hub Engenharia', url: `${BASE_URL}/engenharia`, state: GAME_STATE_FULL, durationMs: 4500,
    run: async (p) => { await p.waitForLoadState('networkidle'); await wait(1200); await smoothScroll(p, 400, 20); await wait(2000); } },

  { id: 'h-07-hub-claude', description: 'Hub Claude', url: `${BASE_URL}/claude-anthropic`, state: GAME_STATE_FULL, durationMs: 4500,
    run: async (p) => { await p.waitForLoadState('networkidle'); await wait(1200); await smoothScroll(p, 400, 20); await wait(2000); } },

  { id: 'h-08-artigo-toc', description: 'Artigo tecnico com TOC', url: `${BASE_URL}/aprenda/o-que-e-llm`, state: GAME_STATE_FULL, durationMs: 4500,
    run: async (p) => { await p.waitForLoadState('networkidle'); await wait(1200); await smoothScroll(p, 500, 30); await wait(1800); } },

  { id: 'h-09-quiz-xp', description: 'Quiz + XP (clique + resultado)', url: `${BASE_URL}/aprenda/o-que-e-ia`, state: GAME_STATE_EMPTY, durationMs: 5000,
    run: async (page, marks) => {
      const startMs = Date.now();
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight - 800, behavior: 'instant' as ScrollBehavior }));
      await wait(600);
      await markClickByText(page, marks, startMs, 'Começar quiz');
      await wait(600);
      await page.evaluate(() => {
        const allButtons = Array.from(document.querySelectorAll('button'));
        const options = allButtons.filter(b => {
          const t = b.textContent || '';
          return t.length > 10 && !t.includes('Começar') && !t.includes('Enviar');
        });
        for (let i = 0; i < options.length; i += 4) options[i + 1]?.click();
      });
      await wait(300);
      await page.evaluate(() => {
        const submit = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Enviar')) as HTMLButtonElement | undefined;
        if (submit && !submit.disabled) submit.click();
      });
      await wait(2000);
    } },

  { id: 'h-10-progresso', description: 'Dashboard progresso', url: `${BASE_URL}/progresso`, state: GAME_STATE_FULL, durationMs: 4500,
    run: async (p) => { await p.waitForLoadState('networkidle'); await wait(1500); await smoothScroll(p, 600, 30); await wait(2000); } },

  { id: 'h-11-srs', description: 'Revisao SRS', url: `${BASE_URL}/revisar`, state: GAME_STATE_FULL, durationMs: 4500,
    run: async (page, marks) => {
      const startMs = Date.now();
      await page.waitForLoadState('networkidle');
      await wait(1500);
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
        const opt = buttons.find(b => {
          const t = b.textContent || '';
          return t.length > 10 && !t.includes('Buscar') && !t.includes('Começar');
        });
        if (opt) {
          const r = opt.getBoundingClientRect();
          opt.click();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: window.innerWidth, h: window.innerHeight };
        }
        return null;
      });
      if (clicked) marks.push({ time: (Date.now() - startMs) / 1000, x: clicked.x / clicked.w, y: clicked.y / clicked.h });
      await wait(2500);
    } },

  { id: 'h-12-home-final', description: 'Home final (background do Proof)', url: `${BASE_URL}/`, state: GAME_STATE_FULL, durationMs: 11000,
    run: async (p) => {
      await p.waitForLoadState('networkidle');
      await wait(1500);
      await smoothScroll(p, 800, 60);
      await wait(2000);
      await smoothScroll(p, 0, 60);
      await wait(4500);
    } },
];

// ── Gravacao ────────────────────────────────────────────────────────────

async function recordBeat(browser: Browser, device: DeviceKind, beat: Beat): Promise<void> {
  const viewport = VIEWPORTS[device];
  const deviceDir = join(BEATS_ROOT, `hero-${device}`);
  const tmpDir = join(deviceDir, '.tmp-webm');
  if (!existsSync(deviceDir)) mkdirSync(deviceDir, { recursive: true });
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

  const initScript = buildInitScript(beat.state, beat.theme ?? 'dark');

  const context: BrowserContext = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: viewport },
    // Mobile UA para phone viewport (carrega CSS responsivo correto)
    userAgent: device === 'phone'
      ? 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36'
      : undefined,
    isMobile: device === 'phone',
    hasTouch: device === 'phone',
  });
  await context.addInitScript(initScript);

  const page = await context.newPage();
  const marks: ClickMark[] = [];
  const start = Date.now();

  try {
    await page.goto(beat.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await beat.run(page, marks);
    const elapsed = Date.now() - start;
    if (elapsed < beat.durationMs) await wait(beat.durationMs - elapsed);
  } catch (err) {
    console.log(`  ⚠ ${beat.id}: ${err instanceof Error ? err.message : err}`);
  }

  const video = page.video();
  await page.close();
  await context.close();

  if (!video) {
    console.log(`  ✗ video vazio para ${beat.id}`);
    return;
  }

  const webmPath = await video.path();
  const targetWebm = join(deviceDir, `${beat.id}.webm`);
  const targetMp4 = join(deviceDir, `${beat.id}.mp4`);

  renameSync(webmPath, targetWebm);

  try {
    execSync(
      `ffmpeg -y -i "${targetWebm}" -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart -an "${targetMp4}"`,
      { stdio: 'pipe' }
    );
    rmSync(targetWebm);
  } catch (err) {
    console.log(`  ⚠ ffmpeg falhou: ${err instanceof Error ? err.message : err}`);
    return;
  }

  const manifest: BeatManifest = {
    id: beat.id,
    durationSec: (Date.now() - start) / 1000,
    width: viewport.width,
    height: viewport.height,
    clicks: marks,
  };
  writeFileSync(join(deviceDir, `${beat.id}.json`), JSON.stringify(manifest, null, 2));

  console.log(`  ✓ ${beat.id}.mp4 (${manifest.durationSec.toFixed(1)}s, ${marks.length} click${marks.length === 1 ? '' : 's'})`);
}

function writeDeviceManifest(device: DeviceKind): void {
  const dir = join(BEATS_ROOT, `hero-${device}`);
  const files = readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
  const beats = files.sort().map(f => JSON.parse(readFileSync(join(dir, f), 'utf-8'))) as BeatManifest[];
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ device, beats }, null, 2));
}

function parseArgs(): DeviceKind[] {
  const devArg = process.argv.find(a => a.startsWith('--device='))?.split('=')[1];
  const all = process.argv.includes('--all');
  if (all) return ['phone', 'computer'];
  if (devArg === 'phone' || devArg === 'computer') return [devArg];
  console.error('❌ Uso: --device=phone | --device=computer | --all');
  process.exit(1);
}

async function main() {
  const devices = parseArgs();

  console.log('\n🎬 FFV Academy — Record Beats (Playwright)');
  console.log('═'.repeat(60));
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📱 Devices: ${devices.join(', ')}`);
  console.log(`📂 Output: ${BEATS_ROOT}\n`);

  try { await fetch(BASE_URL); console.log('✅ Servidor respondendo\n'); }
  catch {
    console.error(`❌ Servidor nao responde em ${BASE_URL}`);
    console.error('   Inicie com: npm run build && npx serve out -p 8080\n');
    process.exit(1);
  }

  try { execSync('ffmpeg -version', { stdio: 'ignore' }); }
  catch { console.error('❌ ffmpeg nao encontrado'); process.exit(1); }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const device of devices) {
      console.log(`\n▶ Device: ${device} (${VIEWPORTS[device].width}x${VIEWPORTS[device].height})`);
      for (const beat of HERO_BEATS) {
        console.log(`📹 [${beat.id}] ${beat.description}`);
        await recordBeat(browser, device, beat);
      }
      writeDeviceManifest(device);
      const tmp = join(BEATS_ROOT, `hero-${device}`, '.tmp-webm');
      if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
    }
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Concluido\n');
  } finally {
    await browser.close();
  }
}

main().catch(err => { console.error('❌ Erro fatal:', err); process.exit(1); });
