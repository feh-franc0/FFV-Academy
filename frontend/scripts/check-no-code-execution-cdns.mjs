#!/usr/bin/env node
/**
 * Gate: nenhum chunk de produção carrega runtime de execução de código de CDN.
 *
 * ## O defeito que este gate previne
 *
 * `CodePlayground.tsx` (achado P-16, auditoria de segurança de 11/ago/2026)
 * roda `new Function(...)` sobre código não confiável e carrega Pyodide e
 * esbuild-wasm de CDN — hosts que NÃO estão na CSP declarada
 * (`script-src`/`connect-src`, ver `next.config.ts`). O componente foi
 * quarentenado pra `drafts/` (fora de `src/`, fora do `include` do
 * tsconfig) por não ter nenhum importador ativo — mas "sem importador hoje"
 * é um fato sobre O PRESENTE, não uma garantia contra alguém reimportá-lo
 * amanhã. Este gate mede o BUNDLE REAL, não a ausência de import: se as
 * URLs desses runtimes aparecerem em qualquer chunk gerado, o build falha.
 *
 * ## Uso
 *   npm run build && node scripts/check-no-code-execution-cdns.mjs
 *   npm run check:no-code-execution-cdns
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CHUNKS_DIR = join(ROOT, '.next', 'static', 'chunks');

// URLs/hosts que só existem no runtime de execução de código do
// CodePlayground quarentenado — nenhum outro código legítimo da plataforma
// os referencia.
const FORBIDDEN_PATTERNS = [
  'cdn.jsdelivr.net/pyodide',
  'esm.sh/esbuild-wasm',
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith('.js')) out.push(full);
  }
  return out;
}

function main() {
  let files;
  try {
    files = walk(CHUNKS_DIR);
  } catch {
    console.error(
      `check-no-code-execution-cdns: não achei ${CHUNKS_DIR} — rode "npm run build" antes.`,
    );
    process.exit(1);
  }

  const hits = [];
  for (const f of files) {
    const src = readFileSync(f, 'utf-8');
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (src.includes(pattern)) {
        hits.push(`${f.replace(ROOT + '/', '')} → "${pattern}"`);
      }
    }
  }

  if (hits.length > 0) {
    console.error(
      `check-no-code-execution-cdns: ${hits.length} chunk(s) de produção referenciam ` +
      `runtime de execução de código fora da CSP:\n\n${hits.join('\n')}\n\n` +
      `Isso significa que algo em src/ voltou a importar CodePlayground (drafts/) ` +
      `sem sandboxing (ver PENDENCIAS.md, item F-2). Não religue sem isolar em ` +
      `iframe com CSP própria primeiro.`,
    );
    process.exit(1);
  }

  console.log(`check-no-code-execution-cdns: ${files.length} chunks verificados, nenhuma referência a CDN de execução de código.`);
}

main();
