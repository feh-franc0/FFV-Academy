/**
 * generate-og-images.mjs
 *
 * Gera og:image PNG para cada módulo do currículo usando satori + @resvg/resvg-js.
 * Executar após `npm run build`:
 *   node scripts/generate-og-images.mjs
 *
 * Output: out/og/<slug>.png
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../out/og');

// ── Inline curriculum data (subset) ──────────────────────────────────────────
// We import the compiled JS; for a static export, we read directly.
// Since curriculum.ts is TypeScript, we do a minimal inline list here.
// To keep this script independent, we parse the out/ directory for pages.

async function generate(slug, title, icon, xp, trailColor, trailName) {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          width: 1200,
          height: 630,
          padding: '48px 64px',
          background: '#0d1117',
          fontFamily: 'sans-serif',
          position: 'relative',
        },
        children: [
          // Background accent bar
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: trailColor,
              },
            },
          },
          // Trail label
          {
            type: 'div',
            props: {
              style: {
                fontSize: 18,
                color: trailColor,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 16,
              },
              children: trailName,
            },
          },
          // Icon + Title row
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: 72 },
                    children: icon,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 48,
                      fontWeight: 800,
                      color: '#f0f6fc',
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                      maxWidth: 900,
                    },
                    children: title,
                  },
                },
              ],
            },
          },
          // Footer: site + XP
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 24,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: 20, color: '#8b949e', fontWeight: 600 },
                    children: 'fernandofrancovalle.com · FFV Academy',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 18,
                      color: trailColor,
                      fontWeight: 700,
                      padding: '6px 16px',
                      border: `2px solid ${trailColor}`,
                      borderRadius: 999,
                    },
                    children: `+${xp} XP`,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [], // No custom fonts needed — system sans-serif is used
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();
  await writeFile(resolve(OUT_DIR, `${slug}.png`), png);
  console.log(`  ✓ ${slug}.png`);
}

async function main() {
  if (!existsSync(resolve(__dirname, '../out'))) {
    console.error('❌  out/ directory not found — run `npm run build` first');
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`\n🖼  Generating og:images → ${OUT_DIR}\n`);

  // Inline a small representative set; for full generation, expand this list
  // or parse the CURRICULUM from a pre-built JSON.
  const modules = [
    { slug: 'o-que-e-ia',            title: 'O que é Inteligência Artificial?',  icon: '🤖', xp: 30,  trailColor: '#58a6ff', trailName: 'Fundamentos da IA' },
    { slug: 'o-que-e-llm',           title: 'O que é um LLM?',                    icon: '🧠', xp: 50,  trailColor: '#58a6ff', trailName: 'Fundamentos da IA' },
    { slug: 'rag-fundamentos',        title: 'RAG: Fundamentos',                   icon: '📚', xp: 80,  trailColor: '#d2a8ff', trailName: 'Engenharia AI-Native' },
    { slug: 'context-engineering',    title: 'Context Engineering',                icon: '🧬', xp: 80,  trailColor: '#d2a8ff', trailName: 'Engenharia AI-Native' },
    { slug: 'agentes-padroes',        title: 'Padrões de Agentes de IA',           icon: '🤖', xp: 80,  trailColor: '#d2a8ff', trailName: 'Engenharia AI-Native' },
    { slug: 'claude-api-fundamentos', title: 'API da Anthropic: Fundamentos',      icon: '🔗', xp: 75,  trailColor: '#a78bfa', trailName: 'API Claude & Agents' },
    { slug: 'claude-code-primeiros-passos', title: 'Claude Code: Primeiros Passos', icon: '⊕', xp: 50, trailColor: '#cc785c', trailName: 'Claude Code' },
    { slug: 'o-que-e-cloud',          title: 'O que é Cloud Computing?',           icon: '☁️', xp: 30,  trailColor: '#ffa657', trailName: 'AWS Cloud Practitioner' },
    { slug: 'docker-completo',        title: 'Docker Completo',                    icon: '🐳', xp: 80,  trailColor: '#79c0ff', trailName: 'Containers & DevOps' },
    { slug: 'kubernetes-completo',    title: 'Kubernetes Completo',                icon: '⚙️', xp: 90,  trailColor: '#79c0ff', trailName: 'Containers & DevOps' },
  ];

  for (const m of modules) {
    await generate(m.slug, m.title, m.icon, m.xp, m.trailColor, m.trailName);
  }

  console.log(`\n✅  Done! ${modules.length} og:images generated.\n`);
  console.log('Add to each page\'s <head>:');
  console.log('  <meta property="og:image" content="https://fernandofrancovalle.com/og/<slug>.png" />\n');
}

main().catch(err => { console.error(err); process.exit(1); });
