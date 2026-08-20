#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3000';
const apiBaseUrl = process.argv[3] ?? 'https://api.fernandofrancovalle.com';
const trails = JSON.parse(await readFile(new URL('./seeds/trails.json', import.meta.url), 'utf8'));
const labs = trails.find((trail) => trail.href === '/exemplos-arquitetura-aws');

if (!labs) throw new Error('Trilha /exemplos-arquitetura-aws não encontrada.');

const failures = [];
let cursor = 0;
const workers = Array.from({ length: 4 }, async () => {
  while (cursor < labs.modules.length) {
    const slug = labs.modules[cursor++].slug;
    try {
      const [page, api] = await Promise.all([
        fetch(`${baseUrl}/aprenda/${slug}`, { signal: AbortSignal.timeout(30_000) }),
        fetch(`${apiBaseUrl}/api/v1/curriculum/${slug}/blocks`, { signal: AbortSignal.timeout(30_000) }),
      ]);
      const html = await page.text();
      const validPage = page.ok
        && /<h1[ >]/.test(html)
        // O texto do componente de fallback também é enviado no bundle RSC,
        // portanto não é uma prova de que ele foi renderizado. Um bloco de
        // seção só existe no artigo efetivamente montado na página.
        && html.includes('data-section-title=');
      if (!validPage || !api.ok) failures.push({ slug, page: page.status, api: api.status });
    } catch (error) {
      failures.push({ slug, error: error instanceof Error ? error.message : String(error) });
    }
  }
});

await Promise.all(workers);
console.log(JSON.stringify({ baseUrl, total: labs.modules.length, passed: labs.modules.length - failures.length, failures }, null, 2));
process.exitCode = failures.length > 0 ? 1 : 0;
