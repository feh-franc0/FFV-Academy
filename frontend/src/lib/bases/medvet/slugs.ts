/**
 * Lista plana de slugs de módulos medvet — sem importar conteúdo (sections,
 * quiz, key terms). Usado por resolvers/selectors que só precisam saber
 * "este slug pertence a medvet" sem pagar o custo de bundle dos módulos
 * completos.
 *
 * Quando adicionar/remover módulo em medvet, atualizar aqui também.
 * Os testes em __tests__/medvet-slugs-sync.test.ts validam que esta lista
 * bate slug-por-slug e title-por-title com MEDVET_BASE.
 */
export const MEDVET_MODULE_SLUGS: string[] = [
  'genetica-de-populacoes',
  'leis-de-mendel',
  'acoes-genicas-entre-alelos',
  'alelismo-multiplo',
  'genes-letais',
  'interacao-genica-entre-nao-alelos',
  'interacao-genica-pelagem-gatos',
  'cor-pelagem-mamiferos',
  'padroes-de-heranca',
  'frequencia-genica-hardy-weinberg',
  'introducao-ao-melhoramento-genetico',
  'endogamia-x-exogamia',
];

/** Metadata leve dos módulos pra recomendações sem pagar bundle. */
export interface MedvetModuleLite {
  slug: string;
  title: string;
  estimatedMin: number;
  icon: string;
}

export const MEDVET_MODULES_LITE: MedvetModuleLite[] = [
  { slug: 'genetica-de-populacoes',              title: 'Genética de Populações — fundamentos',                          estimatedMin: 18, icon: '🧬' },
  { slug: 'leis-de-mendel',                       title: 'Leis de Mendel — o alicerce da genética',                       estimatedMin: 22, icon: '🧬' },
  { slug: 'acoes-genicas-entre-alelos',           title: 'Ações Gênicas entre Alelos',                                    estimatedMin: 20, icon: '🧬' },
  { slug: 'alelismo-multiplo',                    title: 'Alelismo Múltiplo',                                              estimatedMin: 18, icon: '🧬' },
  { slug: 'genes-letais',                         title: 'Genes Letais',                                                   estimatedMin: 16, icon: '⚠️' },
  { slug: 'interacao-genica-entre-nao-alelos',    title: 'Interação Gênica entre Não Alelos',                             estimatedMin: 24, icon: '🔗' },
  { slug: 'interacao-genica-pelagem-gatos',       title: 'Interação Gênica em Gatos — herança da cor de pelagem',         estimatedMin: 20, icon: '🐈' },
  { slug: 'cor-pelagem-mamiferos',                title: 'Cor de Pelagem em Mamíferos — caso cães',                       estimatedMin: 22, icon: '🐕' },
  { slug: 'padroes-de-heranca',                   title: 'Padrões de Herança — Doenças Hereditárias e Multifatoriais',    estimatedMin: 20, icon: '📊' },
  { slug: 'frequencia-genica-hardy-weinberg',     title: 'Frequência Gênica e Equilíbrio de Hardy-Weinberg',              estimatedMin: 26, icon: '📐' },
  { slug: 'introducao-ao-melhoramento-genetico',  title: 'Introdução ao Melhoramento Genético',                           estimatedMin: 22, icon: '🐄' },
  { slug: 'endogamia-x-exogamia',                 title: 'Endogamia × Exogamia — cruzamentos e heterose',                 estimatedMin: 20, icon: '🧪' },
];
