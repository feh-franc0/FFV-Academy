#!/usr/bin/env node
/**
 * Gate de orçamento de carga por rota.
 *
 * ## O defeito que este gate substitui
 *
 * `bundlesize.config.json` (`npm run bundlesize:check`) mede cada arquivo
 * `.next/static/chunks/*.js` ISOLADO contra um teto de 400 KB. Medido em
 * 10/ago/2026: o maior chunk sozinho tinha 336 KB — PASSAVA — enquanto a
 * SOMA dos ~20 chunks comuns que uma rota carrega chegava a 457 KB gz. O
 * navegador baixa a SOMA, não o maior arquivo; o gate media a métrica
 * errada. Além disso, o passo no CI tinha `continue-on-error: true` — nem a
 * métrica errada bloqueava o merge.
 *
 * ## O que este gate mede
 *
 * Para cada rota crítica (abaixo), soma o tamanho GZIPADO de todo chunk em
 * `firstLoadChunkPaths` — exatamente os `<script>` que o navegador baixa no
 * primeiro carregamento dessa rota, segundo o próprio Next.js. Fonte:
 * `.next/diagnostics/route-bundle-stats.json`, emitido pelo `next build`
 * (Next 16.2.4, sem configuração extra) com `route` + `firstLoadChunkPaths`
 * por rota. Se uma versão futura do Next deixar de gerar esse arquivo, este
 * script falha alto e explícito (não silenciosamente vira no-op).
 *
 * ## Prova negativa (como validar que o gate pega regressão)
 *
 * Reintroduza um import estático do currículo completo em `engine.ts` (ou
 * `badges.ts`/`random-question.ts` — os três caminhos corrigidos em
 * 11/ago/2026), rode `npm run build && node scripts/check-route-bundle.mjs`.
 * O teto de `/` e `/aprenda/[slug]` estoura por ~90 KB e o script sai com
 * código 1, nomeando a rota e o excesso. Reverta a mudança depois — não é
 * para ficar no código.
 *
 * ## Uso
 *   node scripts/check-route-bundle.mjs        # depois de `npm run build`
 *   npm run bundle:check
 */

import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const ROOT = process.cwd();
const STATS_PATH = join(ROOT, '.next', 'diagnostics', 'route-bundle-stats.json');

/**
 * Tetos declarados, em KB gzip — soma de TODOS os chunks de firstLoad da
 * rota. Medido em 11/ago/2026, depois de tirar o currículo completo e o Zod
 * do bundle comum (ver `frontend/CLAUDE.md`, seção "Orçamento de carga"):
 *
 *   /               → 351,4 KB (era 443,7 KB antes da correção)
 *   /aprenda/[slug] → 338,1 KB (era 438,8 KB)
 *   /revisar        → 323,5 KB (era 421,2 KB)
 *   /verificar      → 322,5 KB (era 421,2 KB)
 *
 * Teto = medido + ~12-15% de folga: dá espaço para crescimento real de
 * feature sem re-abrir a régua a cada PR, mas uma regressão do tamanho do
 * currículo completo (~92 KB) ou do Zod (~61 KB) sozinha já estoura.
 */
const TETOS_KB = {
  '/': 400,
  '/aprenda/[slug]': 380,
  '/revisar': 360,
  '/verificar': 360,
};

function main() {
  if (!existsSync(STATS_PATH)) {
    console.error(
      `orcamento-de-carga: ${STATS_PATH} não existe.\n` +
      `Rode \`npm run build\` primeiro — este gate lê o diagnóstico que o build gera.`,
    );
    process.exit(1);
  }

  /** @type {Array<{ route: string, firstLoadChunkPaths: string[], firstLoadUncompressedJsBytes: number }>} */
  const stats = JSON.parse(readFileSync(STATS_PATH, 'utf8'));
  const porRota = new Map(stats.map(e => [e.route, e]));

  const gzCache = new Map();
  function gzKbDoChunk(chunkPath) {
    if (!gzCache.has(chunkPath)) {
      const abs = join(ROOT, chunkPath);
      if (!existsSync(abs)) {
        gzCache.set(chunkPath, 0);
      } else {
        const raw = readFileSync(abs);
        gzCache.set(chunkPath, gzipSync(raw, { level: 9 }).length);
      }
    }
    return gzCache.get(chunkPath);
  }

  const falhas = [];
  const relatorio = [];

  for (const [rota, tetoKb] of Object.entries(TETOS_KB)) {
    const entry = porRota.get(rota);
    if (!entry) {
      falhas.push(
        `${rota}: rota não encontrada em route-bundle-stats.json — foi renomeada, removida, ` +
        `ou o build não a gerou. Atualize TETOS_KB neste script se a rota mudou de nome.`,
      );
      continue;
    }
    const totalBytes = entry.firstLoadChunkPaths.reduce((acc, p) => acc + gzKbDoChunk(p), 0);
    const totalKb = totalBytes / 1024;
    relatorio.push({ rota, totalKb, tetoKb, chunks: entry.firstLoadChunkPaths.length });
    if (totalKb > tetoKb) {
      falhas.push(
        `${rota}: ${totalKb.toFixed(1)} KB gz > teto ${tetoKb} KB gz ` +
        `(excesso: ${(totalKb - tetoKb).toFixed(1)} KB, ${entry.firstLoadChunkPaths.length} chunks)`,
      );
    }
  }

  console.log('Orçamento de carga por rota (gzip, soma dos chunks de firstLoad):\n');
  for (const r of relatorio) {
    const status = r.totalKb > r.tetoKb ? '✗' : '✓';
    console.log(`  ${status} ${r.rota.padEnd(20)} ${r.totalKb.toFixed(1).padStart(7)} KB / ${r.tetoKb} KB  (${r.chunks} chunks)`);
  }

  if (falhas.length > 0) {
    console.error('\norcamento-de-carga: FALHOU\n');
    for (const f of falhas) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log('\norcamento-de-carga: OK');
}

main();
