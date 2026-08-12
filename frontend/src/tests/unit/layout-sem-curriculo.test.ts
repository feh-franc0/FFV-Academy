import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * O layout raiz não pode depender do currículo completo.
 *
 * ## O que este teste garante, e o que ele NÃO garante
 *
 * GARANTE: nenhum caminho de import a partir de `app/layout.tsx` alcança
 * `CURRICULUM`. Isso importa porque tudo o que o layout puxa é código que todas
 * as rotas precisam ter — inclusive `/verificar` e `/sobre`, que não mostram
 * progresso nem busca. Em ago/2026 esse caminho existia por três rotas
 * diferentes (busca, onboarding e o hook de estado), e o currículo completo
 * pesa 224 KB.
 *
 * NÃO GARANTE redução de bundle sozinho. O passo que falta é de configuração
 * do empacotador — Turbopack promove módulo referenciado por muitas rotas a
 * chunk compartilhado carregado em TODAS, mesmo as que não o usam. Mas medido
 * em 11/ago/2026: a causa real de o currículo completo aparecer em 100% das
 * rotas (97 de 97 no `route-bundle-stats.json`) não era esse limite do
 * empacotador — era `engine.ts` e `lib/badges.ts` importando `CURRICULUM`
 * cheio por caminho RELATIVO (`from './curriculum'`), alcançáveis a partir de
 * `GameHUD` (layout raiz) → `useGameState` → `engine.ts`. Este teste não via
 * porque a regex só seguia imports `@/...` — corrigido abaixo para resolver
 * também `./` e `../`, relativos ao arquivo que os declara.
 *
 * Mesmo assim o teste vale: sem ele, o grafo volta a sujar na primeira vez que
 * alguém acrescentar um componente ao layout, e aí nem a configuração do
 * empacotador resolveria.
 */

const SRC = join(process.cwd(), 'src');

const PESADOS_MOD = new Set([
  '@/lib/curriculum',            // barrel: reexporta as consultas, que puxam as trilhas
  '@/lib/curriculum/trails',
  '@/lib/curriculum/queries',    // importa CURRICULUM para as consultas por slug
]);

function resolverAbsoluto(base: string): string | null {
  for (const c of [`${base}.tsx`, `${base}.ts`, join(base, 'index.tsx'), join(base, 'index.ts')]) {
    if (existsSync(c)) return c;
  }
  return null;
}

/**
 * Resolve um module specifier para caminho absoluto, a partir do arquivo que
 * o declara — cobre tanto o alias `@/...` (relativo a `src/`) quanto imports
 * relativos (`./...`, `../...`, relativos ao DIRETÓRIO do arquivo atual).
 * Só resolve caminhos internos ao projeto; pacote de `node_modules` volta null.
 */
function resolver(mod: string, deArquivo: string): string | null {
  if (mod.startsWith('@/')) return resolverAbsoluto(join(SRC, mod.slice(2)));
  if (mod.startsWith('.')) return resolverAbsoluto(join(dirname(deArquivo), mod));
  return null;
}

// Caminhos absolutos dos alvos "pesados" — comparação é por ARQUIVO
// resolvido, não pela string do import, porque `./curriculum` e
// `@/lib/curriculum` apontam pro mesmo arquivo e um import relativo não bate
// com nenhuma string do Set acima.
const PESADOS_ARQUIVO = new Set(
  [...PESADOS_MOD].map(mod => resolverAbsoluto(join(SRC, mod.slice(2)))).filter((p): p is string => !!p),
);

/** Caminhos de import, em largura, a partir de um arquivo. */
function caminhosAte(inicio: string): string[] {
  const visto = new Set<string>();
  const achados: string[] = [];
  const fila: Array<[string, string[]]> = [[inicio, [inicio.replace(SRC, 'src')]]];

  while (fila.length) {
    const [arquivo, trilha] = fila.pop()!;
    if (visto.has(arquivo)) continue;
    visto.add(arquivo);

    const bruto = readFileSync(arquivo, 'utf8');
    // Comentário que MENCIONA um import (para explicar uma regra, como este
    // próprio arquivo faz) não pode contar como o import em si — mesmo ajuste
    // já feito no terceiro teste abaixo, pela mesma razão.
    const src = bruto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    // Import dinâmico não conta: ele vira chunk separado, carregado sob demanda,
    // que é exatamente a solução aplicada ao onboarding e ao palette de busca.
    const semDinamico = src.replace(/import\((?:\s|\S)*?\)/g, '');

    // Cobre `from '@/...'`, `from './...'` e `from '../...'` no mesmo passe.
    for (const m of semDinamico.matchAll(/from '((?:@\/|\.\.?\/)[^']+)'/g)) {
      const mod = m[1];
      const r = resolver(mod, arquivo);
      if (!r) continue;
      if (PESADOS_ARQUIVO.has(r)) {
        achados.push([...trilha.slice(-4), mod].join(' → '));
        continue;
      }
      if (!visto.has(r)) fila.push([r, [...trilha, r.replace(SRC, 'src')]]);
    }
  }
  return [...new Set(achados)];
}

describe('layout raiz', () => {
  it('não alcança o currículo completo por nenhum caminho de import estático', () => {
    const caminhos = caminhosAte(join(SRC, 'app', 'layout.tsx'));
    expect(
      caminhos,
      'algo no layout passou a depender do currículo completo — todas as rotas pagam por isso',
    ).toEqual([]);
  });

  it('o índice leve não carrega os campos que existem para ficar fora dele', () => {
    const leve = readFileSync(join(SRC, 'lib', 'curriculum', 'indice-leve.ts'), 'utf8');
    // `desc` e `keywords` são ~124 KB dos 265 KB das trilhas, e nada no cálculo
    // de progresso os usa. Se voltarem, o índice deixa de ser leve e o gerador é
    // que precisa ser corrigido — não este teste.
    expect(leve).not.toMatch(/"keywords":/);
    expect(leve).not.toMatch(/"desc":/);
    expect(leve).not.toMatch(/"prerequisites":/);
  });

  it('queries-leves não importa o currículo', () => {
    const bruto = readFileSync(join(SRC, 'lib', 'curriculum', 'queries-leves.ts'), 'utf8');
    // Sem os comentários: a primeira versão deste teste acusou a própria nota do
    // arquivo, que MENCIONA `CURRICULUM` para explicar a regra. Gate que reclama
    // de documentação ensina o time a apagar documentação.
    const codigo = bruto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

    // Uma única importação errada aqui desfaz a separação inteira, e em silêncio:
    // o build continua verde e o peso volta para todas as rotas.
    expect(codigo).not.toMatch(/from '\.\/trails'/);
    expect(codigo).not.toMatch(/CURRICULUM/);
  });
});
