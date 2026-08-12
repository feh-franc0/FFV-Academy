import manifesto from './content-manifest.json';

/**
 * Quais módulos têm conteúdo escrito de fato.
 *
 * O `curriculum.ts` declara 415 módulos; parte deles é currículo planejado sem
 * conteúdo produzido, e `/aprenda/<slug>` responde 404 para esses. A navegação
 * contextual (próximo módulo, pré-requisitos, relacionados) não sabia disso e
 * linkava para o vazio: quem terminava um módulo clicava em "próximo" e caía num
 * 404 — 39 links nessa condição no momento da auditoria de jul/2026.
 *
 * Filtrar aqui é robustez permanente, não remendo para os 27 slugs de hoje:
 * qualquer módulo declarado antes de ser escrito passa a ser ignorado pela
 * navegação em vez de virar beco sem saída.
 *
 * A fonte é `content-manifest.json`, gerado por
 * `scripts/import-blocks/src/extract-curriculum.ts` e verificado em
 * `src/tests/integration/sitemap.test.ts`. Não dá para checar o disco em runtime:
 * `scripts/seeds/` fica fora do contexto de build do Docker.
 */

const COM_CONTEUDO: ReadonlySet<string> = new Set(manifesto.slugs);

/** true se `/aprenda/<slug>` tem conteúdo para renderizar. */
export function temConteudo(slug: string): boolean {
  return COM_CONTEUDO.has(slug);
}

/** Mantém só os itens cujo slug tem conteúdo. */
export function apenasComConteudo<T>(itens: T[], slugDe: (item: T) => string): T[] {
  return itens.filter(item => COM_CONTEUDO.has(slugDe(item)));
}

/** Quantos módulos têm conteúdo — usado em contadores de interface. */
export const TOTAL_COM_CONTEUDO = manifesto.slugs.length;
