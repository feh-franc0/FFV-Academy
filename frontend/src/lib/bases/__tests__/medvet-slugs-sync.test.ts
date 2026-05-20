/**
 * Verifica que medvet/slugs.ts (lite, sem conteúdo) fica em sincronia com
 * medvet/index.ts (pesado, com sections/quiz/key terms).
 *
 * Slugs.ts é importado por resolvers e selectors que precisam aparecer no
 * bundle de qualquer página global — usar a versão lite reduz ~50KB+ de
 * bundle. Mas isso só funciona se a lista bater com a fonte de verdade.
 */
import { describe, it, expect } from 'vitest';
import { MEDVET_BASE } from '../medvet';
import { MEDVET_MODULE_SLUGS, MEDVET_MODULES_LITE } from '../medvet/slugs';

describe('medvet slug sync — MEDVET_BASE vs slugs.ts (lite)', () => {
  const slugsFromBase = MEDVET_BASE.trails.flatMap(t => t.modules.map(m => m.slug));

  it('MEDVET_MODULE_SLUGS contém EXATAMENTE os slugs do MEDVET_BASE', () => {
    const baseSet = new Set(slugsFromBase);
    const liteSet = new Set(MEDVET_MODULE_SLUGS);
    expect(liteSet.size).toBe(baseSet.size);
    for (const s of baseSet) expect(liteSet.has(s)).toBe(true);
    for (const s of liteSet) expect(baseSet.has(s)).toBe(true);
  });

  it('MEDVET_MODULES_LITE bate slug-por-slug com MEDVET_BASE', () => {
    const baseSet = new Set(slugsFromBase);
    expect(MEDVET_MODULES_LITE.length).toBe(baseSet.size);
    for (const lite of MEDVET_MODULES_LITE) {
      expect(baseSet.has(lite.slug)).toBe(true);
    }
  });

  it('MEDVET_MODULES_LITE expõe estimatedMin > 0 pra cada módulo (recommendations dependem)', () => {
    for (const m of MEDVET_MODULES_LITE) {
      expect(m.estimatedMin).toBeGreaterThan(0);
      expect(m.title.length).toBeGreaterThan(3);
      expect(m.icon.length).toBeGreaterThan(0);
    }
  });

  it('titles em MEDVET_MODULES_LITE batem com MEDVET_BASE (sem typo silencioso)', () => {
    const baseTitleBySlug = new Map<string, string>();
    for (const t of MEDVET_BASE.trails) {
      for (const m of t.modules) baseTitleBySlug.set(m.slug, m.title);
    }
    for (const lite of MEDVET_MODULES_LITE) {
      expect(baseTitleBySlug.get(lite.slug)).toBe(lite.title);
    }
  });
});
