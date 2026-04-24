/**
 * Smoke tests — trails do Sprint 3A (curriculum v2):
 * Trail 33 Testing Eng, Trail 34 A11y, Trail 38 Postgres Deep.
 */

import { describe, it, expect } from 'vitest';
import { CURRICULUM, BADGES_DEF, HUBS } from '../../lib/curriculum';

describe('Sprint 3A — Trails novas', () => {
  it.each([
    ['trail33', 'Testing Engineering', 8],
    ['trail34', 'Accessibility & Inclusive Engineering', 7],
    ['trail38', 'Database Deep — Postgres Internals', 8],
  ])('trail %s (%s) com pelo menos %d módulos', (id, name, count) => {
    const trail = CURRICULUM.find(t => t.id === id);
    expect(trail, `missing ${id}`).toBeDefined();
    expect(trail!.name).toBe(name);
    expect(trail!.modules.length).toBeGreaterThanOrEqual(count);
  });

  it('cada trail Sprint 3A termina com capstone', () => {
    for (const id of ['trail33', 'trail34', 'trail38']) {
      const trail = CURRICULUM.find(t => t.id === id)!;
      const last = trail.modules[trail.modules.length - 1];
      expect(last.slug.startsWith('capstone-')).toBe(true);
      expect(last.xp).toBeGreaterThanOrEqual(80);
    }
  });
});

describe('Sprint 3A — Badges', () => {
  it.each(['trail33_done', 'trail34_done', 'trail38_done'])(
    'badge %s existe',
    (badgeId) => {
      expect(BADGES_DEF.find(b => b.id === badgeId), badgeId).toBeDefined();
    },
  );
});

describe('Sprint 3A — Hub wiring', () => {
  it('Engenharia inclui trails 33 e 34', () => {
    const hub = HUBS.find(h => h.slug === 'engenharia')!;
    expect(hub.trailIds).toContain('trail33');
    expect(hub.trailIds).toContain('trail34');
  });

  it('trail38 (DB Deep) está em algum hub (Fundamentos no Sprint 3A, movida pra Dados em Sprint 3B)', () => {
    const hostingHub = HUBS.find(h => h.trailIds.includes('trail38'));
    expect(hostingHub, 'trail38 deve estar em algum hub').toBeDefined();
  });
});

describe('Sprint 3A — Integridade de slugs', () => {
  it('zero duplicado em todo o currículo', () => {
    const slugs = CURRICULUM.flatMap(t => t.modules.map(m => m.slug));
    const uniques = new Set(slugs);
    expect(uniques.size).toBe(slugs.length);
  });

  it('Sprint 3A tem seoDesc + keywords em TODOS os módulos', () => {
    for (const id of ['trail33', 'trail34', 'trail38']) {
      const trail = CURRICULUM.find(t => t.id === id)!;
      for (const m of trail.modules) {
        expect(m.seoDesc, `${m.slug}.seoDesc`).toBeTruthy();
        expect(m.keywords, `${m.slug}.keywords`).toBeTruthy();
      }
    }
  });
});

describe('Sprint 3A — Slugs canônicos dos capstones', () => {
  const expectedCapstones = [
    'capstone-harness-testes-produto-real',
    'capstone-remediar-site-inacessivel',
    'capstone-tuning-de-workload-real',
  ];

  it.each(expectedCapstones)('capstone %s existe', (slug) => {
    const flat = CURRICULUM.flatMap(t => t.modules);
    const cap = flat.find(m => m.slug === slug);
    expect(cap, slug).toBeDefined();
    expect(cap!.readTime).toBeGreaterThanOrEqual(16);
  });
});
