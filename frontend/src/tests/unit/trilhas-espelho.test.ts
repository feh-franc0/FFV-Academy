import { describe, it, expect } from 'vitest';
import {
  listTrilhasEspelho,
  getTrilhaEspelhoBySlug,
  totalEstimatedHours,
  type TrilhaEspelho,
} from '@/lib/trilhas-espelho';

describe('trilhas-espelho catalog', () => {
  it('listTrilhasEspelho retorna pelo menos 3 trilhas', () => {
    const all = listTrilhasEspelho();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it('cada trilha tem slug único e modules numerados em ordem', () => {
    const all = listTrilhasEspelho();
    const slugs = new Set(all.map(t => t.slug));
    expect(slugs.size).toBe(all.length); // sem duplicatas
    all.forEach(t => {
      t.modules.forEach((m, idx) => {
        expect(m.num).toBe(idx + 1);
      });
    });
  });

  it('cada modulo tem slug único dentro da trilha', () => {
    const all = listTrilhasEspelho();
    all.forEach(t => {
      const moduleSlugs = new Set(t.modules.map(m => m.slug));
      expect(moduleSlugs.size).toBe(t.modules.length);
    });
  });

  it('cada trilha tem pelo menos 1 módulo com topics não-vazio', () => {
    const all = listTrilhasEspelho();
    all.forEach(t => {
      expect(t.modules.length).toBeGreaterThan(0);
      const someWithTopics = t.modules.some(m => m.topics.length > 0);
      expect(someWithTopics).toBe(true);
    });
  });

  it('getTrilhaEspelhoBySlug retorna trilha existente', () => {
    const t = getTrilhaEspelhoBySlug('oab-41');
    expect(t).not.toBeNull();
    expect(t?.examName).toMatch(/OAB/);
  });

  it('getTrilhaEspelhoBySlug retorna null pra slug inexistente', () => {
    expect(getTrilhaEspelhoBySlug('nao-existe')).toBeNull();
  });

  it('status: apenas valores "live" ou "incubating"', () => {
    const all = listTrilhasEspelho();
    all.forEach(t => {
      expect(['live', 'incubating']).toContain(t.status);
    });
  });

  it('contributorCount ≥ 5 (regra de agregação do MARKET_REFRESH)', () => {
    const all = listTrilhasEspelho();
    all.forEach(t => {
      expect(t.contributorCount).toBeGreaterThanOrEqual(5);
    });
  });

  describe('totalEstimatedHours', () => {
    it('soma minutos / 60 arredondado', () => {
      const fake: TrilhaEspelho = {
        slug: 'fake',
        examName: 'Fake',
        examEdition: 'X',
        baseSlug: 'tecnologia',
        pitch: '...',
        contributorCount: 5,
        publishedAt: '2026-05-19',
        status: 'live',
        modules: [
          { slug: 'a', num: 1, title: '', summary: '', estimatedMin: 90, topics: [] },
          { slug: 'b', num: 2, title: '', summary: '', estimatedMin: 30, topics: [] },
        ],
      };
      expect(totalEstimatedHours(fake)).toBe(2); // 120 / 60
    });

    it('arredonda corretamente (75 min = 1h)', () => {
      const fake: TrilhaEspelho = {
        slug: 'fake2',
        examName: 'Fake2',
        examEdition: 'X',
        baseSlug: 'tecnologia',
        pitch: '',
        contributorCount: 5,
        publishedAt: '2026-05-19',
        status: 'live',
        modules: [{ slug: 'a', num: 1, title: '', summary: '', estimatedMin: 75, topics: [] }],
      };
      expect(totalEstimatedHours(fake)).toBe(1); // round(1.25) = 1
    });
  });
});
