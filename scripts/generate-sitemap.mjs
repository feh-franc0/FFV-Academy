#!/usr/bin/env node
/**
 * Gera public/sitemap.xml a partir do currículo.
 * Rodar: node scripts/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const BASE = 'https://fernandofrancovalle.com';
const today = new Date().toISOString().split('T')[0];

// Parse slugs from curriculum.ts (regex-based to avoid TS compilation)
const curriculumSrc = readFileSync(join(root, 'src/lib/curriculum.ts'), 'utf-8');
const slugs = [...curriculumSrc.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);

const trailRoutes = [
  '/fundamentos-da-ia',
  '/ia-alem-do-llm',
  '/ferramentas-ia-codigo',
  '/aws-cloud-practitioner',
  '/aws-saa-c03',
  '/como-aprender',
  '/devops-containers',
  '/engenharia-software',
  '/ai-native',
  '/sistemas-distribuidos',
  '/observabilidade-sre',
];

const hubRoutes = ['/ia', '/aws', '/engenharia', '/como-aprender'];
const staticRoutes = ['/', '/progresso', '/revisar', '/glossario'];

const allUrls = [
  ...staticRoutes.map(r => ({ loc: `${BASE}${r}`, priority: r === '/' ? '1.0' : '0.6' })),
  ...hubRoutes.map(r => ({ loc: `${BASE}${r}`, priority: '0.8' })),
  ...trailRoutes.map(r => ({ loc: `${BASE}${r}`, priority: '0.8' })),
  ...slugs.map(s => ({ loc: `${BASE}/aprenda/${s}`, priority: '0.7' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync(join(root, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml gerado com ${allUrls.length} URLs`);
