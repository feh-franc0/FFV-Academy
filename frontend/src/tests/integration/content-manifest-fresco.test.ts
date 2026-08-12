import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import manifesto from '@/lib/content-manifest.json';

/**
 * O manifesto de conteúdo é um arquivo GERADO e COMMITADO. Isso é conveniente —
 * o cliente lê um JSON pequeno em vez do diretório de seeds — e é exatamente o
 * arranjo que apodrece em silêncio: quem escreve um módulo novo não tem por que
 * lembrar de rodar `extract-curriculum`, e nada quebra quando esquece. O
 * manifesto simplesmente passa a descrever um passado.
 *
 * Duas coisas dependem dele hoje:
 *  - `sitemap.ts` filtra por `slugs` para não publicar URL que responde 404;
 *  - a home exibe `porTrilha[...].diagramas` e `.quizzes` como prova de
 *    profundidade. Antes de ago/2026 esse número era o literal '29' no JSX,
 *    correto por coincidência.
 *
 * Este teste recalcula tudo a partir dos seeds e compara. Se falhar, o conserto
 * é uma linha:
 *
 *     cd scripts/import-blocks && npx tsx src/extract-curriculum.ts
 */

const RAIZ = join(process.cwd(), '..');
const SEEDS = join(RAIZ, 'scripts', 'seeds', 'articles');
const MAPPINGS = join(RAIZ, 'scripts', 'seeds', 'article-mappings.json');

interface BlocoBruto {
  type?: string;
  children?: BlocoBruto[];
}

/** Conta diagramas e quizzes de um seed, em qualquer profundidade da árvore. */
function contar(caminho: string): { diagramas: number; quizzes: number } {
  const doc = JSON.parse(readFileSync(caminho, 'utf8')) as { blocks?: BlocoBruto[] };
  let diagramas = 0;
  let quizzes = 0;

  const andar = (bs: BlocoBruto[] | undefined) => {
    for (const b of bs ?? []) {
      // `aws_diagram` é o nome antigo, mantido como alias — os dois contam.
      if (b.type === 'arch_diagram' || b.type === 'aws_diagram') diagramas += 1;
      if (b.type === 'quiz') quizzes += 1;
      andar(b.children);
    }
  };

  andar(doc.blocks);
  return { diagramas, quizzes };
}

const mappings = JSON.parse(readFileSync(MAPPINGS, 'utf8')) as Array<{
  slug: string;
  trail_id: string;
}>;

/** Recalcula `porTrilha` do zero, do mesmo jeito que o gerador faz. */
function recalcularPorTrilha() {
  const saida: Record<string, { modulos: number; diagramas: number; quizzes: number }> = {};

  for (const { slug, trail_id: trilha } of mappings) {
    saida[trilha] ??= { modulos: 0, diagramas: 0, quizzes: 0 };
    const caminho = join(SEEDS, `${slug}.json`);
    if (!existsSync(caminho)) continue;

    const { diagramas, quizzes } = contar(caminho);
    saida[trilha].modulos += 1;
    saida[trilha].diagramas += diagramas;
    saida[trilha].quizzes += quizzes;
  }

  return saida;
}

describe('content-manifest.json reflete os seeds', () => {
  it('a lista de slugs com conteúdo está atualizada', () => {
    const noDisco = readdirSync(SEEDS)
      .filter(f => f.endsWith('.json') && !f.startsWith('_'))
      .map(f => f.replace(/\.json$/, ''));

    // O manifesto lista só slug declarado no currículo — seed órfão fica fora,
    // e a comparação precisa respeitar isso.
    const declarados = new Set(mappings.map(m => m.slug));
    const esperado = noDisco.filter(s => declarados.has(s)).sort();

    expect(manifesto.slugs).toEqual(esperado);
    expect(manifesto.total).toBe(esperado.length);
  });

  it('as contagens por trilha batem com os seeds', () => {
    expect(manifesto.porTrilha).toEqual(recalcularPorTrilha());
  });

  it('a trilha exibida na home existe no manifesto', () => {
    // BedrockDestaque omite a linha se a chave faltar, então a página não quebra;
    // mas se a chave desaparecer, o número sai da home sem ninguém notar.
    const porTrilha = manifesto.porTrilha as Record<string, { diagramas: number }>;
    expect(porTrilha['trail-bedrock']).toBeDefined();
    expect(porTrilha['trail-bedrock'].diagramas).toBeGreaterThan(0);
  });
});
