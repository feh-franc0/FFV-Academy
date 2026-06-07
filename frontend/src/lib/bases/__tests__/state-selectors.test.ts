/**
 * State selectors — testa o filtro de slices do GameState pela base ativa.
 */
import { describe, it, expect } from 'vitest';
import {
  selectCompletedForBase,
  selectDueCardsForBase,
  selectLastArticleForBase,
  selectBookmarksForBase,
  selectQuizScoresForBase,
  selectTotalModulesForBase,
  selectRecommendationsForBase,
} from '../state-selectors';

// Slugs reais conhecidos:
// tech: 'transformers-arquitetura', 'rag-retrieval-augmented-generation', etc.
// medvet: 'genetica-de-populacoes', 'leis-de-mendel', etc.
const TECH_SLUG = 'transformers-arquitetura';
const MEDVET_SLUG = 'leis-de-mendel';
const UNKNOWN_SLUG = 'this-slug-does-not-exist-anywhere';

describe('selectCompletedForBase', () => {
  it('mantém só slugs da base no array de completed', () => {
    const result = selectCompletedForBase([TECH_SLUG, MEDVET_SLUG], 'medicina-veterinaria');
    expect(result).toEqual([MEDVET_SLUG]);
  });

  it('tech base também filtra slugs de medvet', () => {
    const result = selectCompletedForBase([TECH_SLUG, MEDVET_SLUG], 'tecnologia');
    expect(result).toContain(TECH_SLUG);
    expect(result).not.toContain(MEDVET_SLUG);
  });

  it('slug desconhecido vai pra tech (retrocompat)', () => {
    const result = selectCompletedForBase([UNKNOWN_SLUG], 'tecnologia');
    expect(result).toEqual([UNKNOWN_SLUG]);
    const medvet = selectCompletedForBase([UNKNOWN_SLUG], 'medicina-veterinaria');
    expect(medvet).toEqual([]);
  });
});

describe('selectDueCardsForBase', () => {
  it('filtra cards SRS pela base do slug', () => {
    const cards = [
      { slug: TECH_SLUG, dueDate: '2026-05-20' },
      { slug: MEDVET_SLUG, dueDate: '2026-05-20' },
    ];
    expect(selectDueCardsForBase(cards, 'medicina-veterinaria')).toHaveLength(1);
    expect(selectDueCardsForBase(cards, 'medicina-veterinaria')[0].slug).toBe(MEDVET_SLUG);
  });

  it('preserva campos extras do card (genérico)', () => {
    const cards = [{ slug: MEDVET_SLUG, dueDate: '2026-05-20', easeFactor: 2.5, interval: 3 }];
    const result = selectDueCardsForBase(cards, 'medicina-veterinaria');
    expect(result[0]).toMatchObject({ easeFactor: 2.5, interval: 3 });
  });
});

describe('selectLastArticleForBase', () => {
  it('devolve lastArticle se for da base', () => {
    const la = { slug: MEDVET_SLUG, title: 'Leis de Mendel' };
    expect(selectLastArticleForBase(la, 'medicina-veterinaria')).toEqual(la);
  });

  it('devolve null se for de outra base', () => {
    const la = { slug: TECH_SLUG, title: 'Transformers' };
    expect(selectLastArticleForBase(la, 'medicina-veterinaria')).toBeNull();
  });

  it('null in → null out', () => {
    expect(selectLastArticleForBase(null, 'tecnologia')).toBeNull();
    expect(selectLastArticleForBase(undefined, 'tecnologia')).toBeNull();
  });

  it('lastArticle de slug desconhecido vai pra tech', () => {
    const la = { slug: UNKNOWN_SLUG, title: 'Algo antigo' };
    expect(selectLastArticleForBase(la, 'tecnologia')).toEqual(la);
    expect(selectLastArticleForBase(la, 'medicina-veterinaria')).toBeNull();
  });
});

describe('selectBookmarksForBase', () => {
  it('mesma lógica de completedModules', () => {
    expect(selectBookmarksForBase([TECH_SLUG, MEDVET_SLUG], 'medicina-veterinaria')).toEqual([MEDVET_SLUG]);
  });
});

describe('selectQuizScoresForBase', () => {
  it('filtra quiz scores pela base', () => {
    const scores = {
      [TECH_SLUG]: { score: 8, total: 10, perfect: false },
      [MEDVET_SLUG]: { score: 10, total: 10, perfect: true },
    };
    const result = selectQuizScoresForBase(scores, 'medicina-veterinaria');
    expect(Object.keys(result)).toEqual([MEDVET_SLUG]);
  });
});

describe('selectTotalModulesForBase', () => {
  it('tech retorna count de CURRICULUM', () => {
    const total = selectTotalModulesForBase('tecnologia');
    expect(total).toBeGreaterThan(100); // CURRICULUM tem 900+ módulos
  });

  it('medvet retorna 16 (Genética 12 + Métodos de Seleção 4)', () => {
    expect(selectTotalModulesForBase('medicina-veterinaria')).toBe(16);
  });

  it('base desconhecida → 0', () => {
    expect(selectTotalModulesForBase('fantasma')).toBe(0);
  });

  // Regra crítica: as 6 novas bases profissionais precisam ter total > 0
  // (caso contrário, dashboards mostram "0 de 0" e parecem quebradas).
  // O contador é derivado do moduleToBase em module-base-resolver.ts.
  it.each([
    ['carreira',                 13],
    ['comunicacao',              14],
    ['marketing',                35],
    ['conteudo',                  6],
    ['empreendedorismo',         15],
    ['ingles',                   89],
    ['cinema',                  100],
    ['vendas',                   30],
    ['psicologia-do-consumo',    60],
  ])('%s retorna %d módulos', (slug, expected) => {
    expect(selectTotalModulesForBase(slug)).toBe(expected);
  });
});

describe('selectRecommendationsForBase', () => {
  it('tech: recomenda módulos tech', () => {
    const recs = selectRecommendationsForBase([], 'tecnologia', 3);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(3);
    // Cada rec tem href /aprenda/... (tech)
    for (const r of recs) {
      expect(r.href.startsWith('/aprenda/')).toBe(true);
    }
  });

  it('medvet: recomenda módulos medvet com href /medicina-veterinaria/...', () => {
    const recs = selectRecommendationsForBase([], 'medicina-veterinaria', 3);
    expect(recs.length).toBe(3);
    for (const r of recs) {
      expect(r.href.startsWith('/medicina-veterinaria/')).toBe(true);
      expect(r.trailName).toBe('Genética Veterinária');
    }
  });

  it('NUNCA vaza tech recs em medvet (caso crítico do bug)', () => {
    const recs = selectRecommendationsForBase([TECH_SLUG], 'medicina-veterinaria', 5);
    for (const r of recs) {
      expect(r.href.startsWith('/aprenda/')).toBe(false);
    }
  });

  it('NUNCA vaza medvet recs em tech', () => {
    const recs = selectRecommendationsForBase([MEDVET_SLUG], 'tecnologia', 5);
    for (const r of recs) {
      expect(r.href.startsWith('/medicina-veterinaria/')).toBe(false);
    }
  });

  it('pula módulos já completados', () => {
    const recs = selectRecommendationsForBase(['leis-de-mendel', 'genetica-de-populacoes'], 'medicina-veterinaria', 3);
    const slugs = recs.map(r => r.slug);
    expect(slugs).not.toContain('leis-de-mendel');
    expect(slugs).not.toContain('genetica-de-populacoes');
  });
});
