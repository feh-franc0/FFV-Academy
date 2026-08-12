#!/usr/bin/env node
/**
 * Gate de hex de tema à mão em `style={{}}`.
 *
 * ## O defeito que este gate previne
 *
 * `SimuladoCard` fixava `#f78166`/`#a371f7` em vez de `var(--ffv-red)`/
 * `var(--ffv-purple)` — 2,21:1 e 2,9:1 em tema claro (ver `frontend/CLAUDE.md`,
 * seção Acessibilidade). O hex funciona no tema em que foi escrito e quebra
 * silenciosamente no outro, porque não segue a variável quando o tema troca.
 * Medido em 11/ago/2026: **126 ocorrências em 54 arquivos** de hex literal,
 * dentro de `style={{}}`, que reproduzem EXATAMENTE o valor atual de um
 * token de tema (`--ffv-*`, `--primary`, `--background` etc., nos dois
 * temas). Corrigido um lote nesta rodada (`consistencia-visual-e-
 * acessibilidade`, 11/ago/2026) — 89 permanecem, dívida grande demais para
 * zerar numa sessão.
 *
 * ## Por que ratchet, não zero
 *
 * Excluir hex fora de `style={{}}` (ex.: `avatar-color.ts`, `readable-text.ts`)
 * seria bloquear código correto — aqueles arquivos são justamente onde o hex
 * TEM de ser literal (paleta de dado, ou o par escuro/claro que serve de
 * fallback quando não se pode confiar num token que muda por tema). Zerar as
 * 116 restantes exigiria auditar caso a caso se o hex é: (a) duplicata de
 * token → trocar; (b) cor de marca de terceiro (LinkedIn `#0a66c2`, Twitter)
 * → manter, comentário `hex-ok`; (c) cor de conteúdo (trilha/hub/cert) → já
 * tratada por `readableTextColor()`, não entra nesta contagem porque não é
 * hex fixo repetido. Impraticável em uma sessão; o TETO evita que o número
 * SUBA enquanto o resto não é migrado — mesmo padrão de
 * `check-route-bundle.mjs` e do teto de contraste por rota da varredura.
 *
 * ## Exceções
 * - `opengraph-image.tsx`: roda no runtime do `next/og`, que não carrega CSS
 *   — a cor tem de ir literal.
 * - Comentário `hex-ok` na mesma linha do hex: escape documentado para cor de
 *   marca de terceiro (ex.: `background: '#0a66c2', // hex-ok: LinkedIn`).
 *
 * ## Uso
 *   node scripts/check-hex-in-style.mjs
 *   (chamado por `npm run lint`)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

/** Teto atual — só pode DESCER. Medido em 11/ago/2026 após corrigir um lote;
 * caiu para 87 em 12/ago/2026 quando CodePlayground.tsx saiu de src/ (achado
 * P-16, quarentenado em drafts/ — tinha hex duplicando token de tema). */
const TETO = 87;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (/\.tsx?$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function tokenHexValues() {
  const css = readFileSync(join(SRC, 'app', 'globals.css'), 'utf-8');
  const values = new Set();
  const re =
    /--(?:ffv-[a-z0-9-]+|primary|primary-foreground|background|foreground|accent|accent-foreground|destructive|border|muted|card|secondary):\s*(#[0-9a-fA-F]{6})\s*;/g;
  for (const m of css.matchAll(re)) values.add(m[1].toLowerCase());
  return values;
}

function main() {
  const tokenHex = tokenHexValues();
  const files = walk(SRC).filter(
    f =>
      !f.endsWith('opengraph-image.tsx') &&
      !f.includes(`${join('src', 'tests')}`) &&
      !f.includes('__tests__'),
  );

  const violacoes = [];
  for (const f of files) {
    const rel = f.replace(ROOT + '/', '');
    const src = readFileSync(f, 'utf-8');
    for (const m of src.matchAll(/style=\{\{[\s\S]*?\}\}/g)) {
      for (const hm of m[0].matchAll(/#[0-9a-fA-F]{6}\b/g)) {
        if (!tokenHex.has(hm[0].toLowerCase())) continue;
        const idx = m.index + hm.index;
        const linhaTexto = src.slice(src.lastIndexOf('\n', idx) + 1, src.indexOf('\n', idx));
        if (linhaTexto.includes('hex-ok')) continue;
        const linha = src.slice(0, idx).split('\n').length;
        violacoes.push(`${rel}:${linha} → ${hm[0]}`);
      }
    }
  }

  const n = violacoes.length;
  if (n > TETO) {
    console.error(
      `check-hex-in-style: ${n} ocorrências de hex duplicando token de tema em style={{}} ` +
      `(teto: ${TETO}). Regressão de ${n - TETO}.\n\n` +
      violacoes.join('\n') +
      `\n\nTroque o hex por 'var(--ffv-*)' (ver frontend/CLAUDE.md, seção Acessibilidade). ` +
      `Cor de marca de terceiro: comentário // hex-ok na mesma linha.`,
    );
    process.exit(1);
  }

  if (n < TETO) {
    console.log(
      `check-hex-in-style: ${n} ocorrências (teto ${TETO}) — dívida caiu. ` +
      `Desça TETO para ${n} em scripts/check-hex-in-style.mjs para travar o ganho.`,
    );
  } else {
    console.log(`check-hex-in-style: ${n} ocorrências, dentro do teto (${TETO}).`);
  }
}

main();
