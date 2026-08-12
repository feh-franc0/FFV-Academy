/**
 * Smoke tests — Sprint 3B (curriculum v2):
 * Trails 24 Data Eng, 25 Fine-tuning, 26 LLM Evals; Hub Dados; Roadmaps.
 */

import { describe, it, expect } from 'vitest';
import { SEO_DESCRIPTIONS } from '@/lib/seo-descriptions';
import { CURRICULUM, BADGES_DEF, HUBS } from '../../lib/curriculum';
import { ROADMAPS, resolveRoadmap, getRoadmap } from '../../lib/roadmaps';

describe('Sprint 3B — Trails novas', () => {
  it.each([
    ['trail24', 'Data Engineering Moderna', 10],
    ['trail25', 'Fine-tuning & Customização de LLMs', 8],
    ['trail26', 'LLM Evals Profissional', 7],
  ])('trail %s (%s) com pelo menos %d módulos', (id, name, count) => {
    const trail = CURRICULUM.find(t => t.id === id);
    expect(trail, `missing ${id}`).toBeDefined();
    expect(trail!.name).toBe(name);
    expect(trail!.modules.length).toBeGreaterThanOrEqual(count);
  });

  it('cada trail Sprint 3B termina com capstone', () => {
    for (const id of ['trail24', 'trail25', 'trail26']) {
      const trail = CURRICULUM.find(t => t.id === id)!;
      const last = trail.modules[trail.modules.length - 1];
      expect(last.slug.startsWith('capstone-')).toBe(true);
      expect(last.xp).toBeGreaterThanOrEqual(80);
    }
  });
});

describe('Sprint 3B — Badges', () => {
  it.each(['trail24_done', 'trail25_done', 'trail26_done'])(
    'badge %s existe',
    (badgeId) => {
      expect(BADGES_DEF.find(b => b.id === badgeId), badgeId).toBeDefined();
    },
  );
});

describe('Sprint 3B — Hub Dados (absorvido por Produção em ago/2026)', () => {
  it('as trilhas de dados vivem em `engenharia`, e `dados` não existe mais como hub', () => {
    // O hub `dados` tinha quatro trilhas de assunto de apoio e foi fundido em
    // `engenharia`: dado e operação são o mesmo problema visto de dois lados.
    // O que este teste protege é que nenhuma trilha se PERDEU na fusão.
    expect(HUBS.find(h => h.slug === 'dados')).toBeUndefined();
    const hub = HUBS.find(h => h.slug === 'engenharia')!;
    expect(hub.trailIds).toContain('trail24');
    expect(hub.trailIds).toContain('trail38');
  });

  it('Base técnica não tem trail38 — ele é da camada de dados, em Produção', () => {
    const hub = HUBS.find(h => h.slug === 'fundamentos')!;
    expect(hub.trailIds).not.toContain('trail38');
  });

  it('IA inclui trail25 e trail26', () => {
    const hub = HUBS.find(h => h.slug === 'ia')!;
    expect(hub.trailIds).toContain('trail25');
    expect(hub.trailIds).toContain('trail26');
  });
});

describe('Sprint 3B — Roadmaps', () => {
  it('tem pelo menos 5 roadmaps', () => {
    expect(ROADMAPS.length).toBeGreaterThanOrEqual(5);
  });

  it('cada roadmap tem stages não-vazios', () => {
    for (const r of ROADMAPS) {
      expect(r.stages.length).toBeGreaterThan(0);
      for (const s of r.stages) {
        expect(s.trailIds.length).toBeGreaterThan(0);
        expect(s.outcome).toBeTruthy();
      }
    }
  });

  it('resolveRoadmap resolve todas as trails referenciadas', () => {
    for (const r of ROADMAPS) {
      const stages = resolveRoadmap(r);
      for (let i = 0; i < r.stages.length; i++) {
        const stageTrails = stages[i].trails;
        expect(stageTrails.length, `${r.id} stage ${i} all trails resolve`).toBe(r.stages[i].trailIds.length);
      }
    }
  });

  it('getRoadmap retorna por id', () => {
    const r = getRoadmap('zero-staff-ia');
    expect(r).toBeDefined();
    expect(r!.title).toContain('Staff Engineer em IA');
  });

  it('getRoadmap retorna undefined pra id unknown', () => {
    expect(getRoadmap('xxx-404')).toBeUndefined();
  });
});

describe('Sprint 3B — Integridade', () => {
  it('zero slug duplicado após Sprint 3B (+25 módulos novos)', () => {
    const slugs = CURRICULUM.flatMap(t => t.modules.map(m => m.slug));
    const uniques = new Set(slugs);
    expect(uniques.size).toBe(slugs.length);
  });

  it('Trails Sprint 3B têm seoDesc + keywords em TODOS os módulos', () => {
    for (const id of ['trail24', 'trail25', 'trail26']) {
      const trail = CURRICULUM.find(t => t.id === id)!;
      for (const m of trail.modules) {
        expect(SEO_DESCRIPTIONS[m.slug], `${m.slug} em SEO_DESCRIPTIONS`).toBeTruthy();
        expect(m.keywords, `${m.slug}.keywords`).toBeTruthy();
      }
    }
  });

  it('CURRICULUM tem pelo menos 27 trails após Sprint 3B', () => {
    // Contagem real: 18 iniciais + 4 Sprint2 + 3 Sprint3A + 3 Sprint3B = 28
    // (trail6 foi deprecated). Guarda piso seguro.
    expect(CURRICULUM.length).toBeGreaterThanOrEqual(27);
  });
});
