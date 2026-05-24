import { describe, it, expect } from 'vitest';

import { MEDVET_BASE, getModuleBySlug, getAllModuleSlugs } from '@/lib/bases/medvet';
import { MEDVET_THEME } from '@/lib/bases/medvet/theme';
import {
  MEDVET_HUBS,
  MEDVET_PATHS,
  MEDVET_TOTAL_MODULES,
  MEDVET_TOTAL_TRAILS,
  MEDVET_TOTAL_HUBS,
} from '@/lib/bases/medvet/adapters';
import { MEDVET_NAV_ITEMS } from '@/lib/bases/medvet/nav';
import {
  SIMULADO_GENETICA,
  SIMULADO_META,
} from '@/lib/bases/medvet/simulado-genetica';

describe('Base Medvet — integridade dos dados', () => {
  it('tem 16 módulos (12 na Genética + 4 em Métodos de Seleção)', () => {
    expect(MEDVET_TOTAL_MODULES).toBe(16);
    const slugs = getAllModuleSlugs();
    expect(slugs).toHaveLength(16);
    // Numeração contínua de 1 a 16 entre as duas trilhas
    const allNums = MEDVET_BASE.trails.flatMap(t => t.modules.map(m => m.num));
    expect(allNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });

  it('tem exatamente 2 trilhas (Genética + Métodos de Seleção) e 4 hubs', () => {
    expect(MEDVET_TOTAL_TRAILS).toBe(2);
    expect(MEDVET_TOTAL_HUBS).toBe(4);
    expect(MEDVET_BASE.trails[0].slug).toBe('genetica');
    expect(MEDVET_BASE.trails[1].slug).toBe('metodos-selecao-e-testes');
  });

  it('cada módulo (de qualquer trilha) tem keyTerms, sections e quiz não-vazios', () => {
    for (const trail of MEDVET_BASE.trails) {
      for (const m of trail.modules) {
        expect(m.keyTerms.length, `${m.slug} keyTerms`).toBeGreaterThan(0);
        expect(m.sections.length, `${m.slug} sections`).toBeGreaterThan(0);
        expect(m.quiz.length, `${m.slug} quiz`).toBeGreaterThan(0);
      }
    }
  });

  it('todas as questões dos módulos têm 4+ opções e correct válido', () => {
    for (const trail of MEDVET_BASE.trails) {
      for (const m of trail.modules) {
        for (const q of m.quiz) {
          expect(q.options.length, `${m.slug}: ${q.question.slice(0, 30)}`).toBeGreaterThanOrEqual(2);
          expect(q.correct).toBeGreaterThanOrEqual(0);
          expect(q.correct).toBeLessThan(q.options.length);
          expect(q.explanation.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('hubs referem-se apenas a slugs existentes', () => {
    const allSlugs = new Set(getAllModuleSlugs());
    for (const hub of MEDVET_BASE.hubs ?? []) {
      for (const slug of hub.moduleSlugs) {
        expect(allSlugs.has(slug), `Hub ${hub.slug} referencia slug inexistente: ${slug}`).toBe(true);
      }
    }
  });

  it('getModuleBySlug recupera módulo por slug', () => {
    const found = getModuleBySlug('leis-de-mendel');
    expect(found).toBeDefined();
    expect(found!.module.num).toBe(2);
    expect(found!.trail.slug).toBe('genetica');
  });

  it('getModuleBySlug retorna undefined para slug inválido', () => {
    expect(getModuleBySlug('inexistente')).toBeUndefined();
  });
});

describe('Base Medvet — adapters', () => {
  it('MEDVET_HUBS converte os 4 hubs com colorIndex válido', () => {
    expect(MEDVET_HUBS).toHaveLength(4);
    for (const hub of MEDVET_HUBS) {
      expect(hub.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(hub.moduleCount).toBeGreaterThan(0);
    }
  });

  it('MEDVET_PATHS gera 4 caminhos diagnósticos apontando para módulos reais', () => {
    expect(MEDVET_PATHS).toHaveLength(4);
    for (const p of MEDVET_PATHS) {
      expect(p.href).toMatch(/^\/medicina-veterinaria\//);
    }
  });

  it('MEDVET_NAV_ITEMS tem o atalho do simulado', () => {
    expect(MEDVET_NAV_ITEMS.some(i => i.href.includes('simulado-genetica'))).toBe(true);
  });
});

describe('Tema MEDVET — sage palette', () => {
  it('paleta sage + cream + terracota (gender-neutral)', () => {
    expect(MEDVET_THEME.accent).toBe('#8a9b7e');     // sage primary
    expect(MEDVET_THEME.success).toBe('#6b9080');    // forest sage
    expect(MEDVET_THEME.accentLight).toBe('#d4a574'); // honey gold
  });

  it('4 hubColors distintos', () => {
    const colors = new Set(MEDVET_THEME.hubColors);
    expect(colors.size).toBe(4);
  });
});

describe('Simulado Genética — 100 questões', () => {
  it('tem exatamente 100 questões com IDs únicos q001..q100', () => {
    expect(SIMULADO_GENETICA).toHaveLength(100);
    const ids = SIMULADO_GENETICA.map(q => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
    expect(ids[0]).toBe('q001');
    expect(ids[99]).toBe('q100');
  });

  it('META bate com a contagem real', () => {
    expect(SIMULADO_META.totalQuestions).toBe(SIMULADO_GENETICA.length);
    expect(SIMULADO_META.passingScore).toBeGreaterThan(0);
    expect(SIMULADO_META.passingScore).toBeLessThanOrEqual(100);
  });

  it('todas as questões têm 4 opções e correct válido', () => {
    for (const q of SIMULADO_GENETICA) {
      expect(q.options.length, q.id).toBe(4);
      expect(q.correct, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correct, q.id).toBeLessThan(4);
    }
  });

  it('toda questão tem explanation com pelo menos 50 caracteres', () => {
    for (const q of SIMULADO_GENETICA) {
      expect(q.explanation.length, `${q.id}: ${q.question.slice(0, 30)}`).toBeGreaterThanOrEqual(50);
    }
  });

  it('topics são strings não-vazias', () => {
    const topics = new Set(SIMULADO_GENETICA.map(q => q.topic));
    expect(topics.size).toBeGreaterThan(5); // pelo menos 6 tópicos distintos
    for (const q of SIMULADO_GENETICA) {
      expect(q.topic.length).toBeGreaterThan(0);
    }
  });

  it('difficulty é easy | medium | hard', () => {
    for (const q of SIMULADO_GENETICA) {
      expect(['easy', 'medium', 'hard']).toContain(q.difficulty);
    }
  });

  it('distribuição de dificuldade não é monotônica (variedade)', () => {
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const q of SIMULADO_GENETICA) counts[q.difficulty]++;
    expect(counts.easy).toBeGreaterThan(5);
    expect(counts.medium).toBeGreaterThan(5);
    expect(counts.hard).toBeGreaterThan(5);
  });
});
