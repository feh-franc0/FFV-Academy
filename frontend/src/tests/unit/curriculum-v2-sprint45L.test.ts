/**
 * Smoke tests — Sprint 4-5-L (curriculum v2):
 * Sprint 4 P2: trails 27, 28, 29, 30, 31, 32, 40.
 * Sprint 5: trails 35, 37, 39, 42.
 * Sprint L (Linguagens): trails 43, 44, 45, 46, 47, 48.
 */

import { describe, it, expect } from 'vitest';
import { CURRICULUM, BADGES_DEF, HUBS } from '../../lib/curriculum';

const SPRINT4 = ['trail27', 'trail28', 'trail29', 'trail30', 'trail31', 'trail32', 'trail40'];
const SPRINT5 = ['trail35', 'trail37', 'trail39', 'trail42'];
const SPRINTL = ['trail43', 'trail44', 'trail45', 'trail46', 'trail47', 'trail48'];
const ALL = [...SPRINT4, ...SPRINT5, ...SPRINTL];

describe('Sprint 4-5-L — Trails existem e têm módulos', () => {
  it.each(ALL)('trail %s existe com modules.length > 0', (id) => {
    const t = CURRICULUM.find(tr => tr.id === id);
    expect(t, `missing ${id}`).toBeDefined();
    expect(t!.modules.length).toBeGreaterThan(0);
    expect(t!.href, `${id} precisa de href pra landing page`).toBeTruthy();
  });

  it('trail27 AWS SAP tem >=18 módulos (trilha expert)', () => {
    const t = CURRICULUM.find(tr => tr.id === 'trail27')!;
    expect(t.modules.length).toBeGreaterThanOrEqual(18);
  });

  it('cada trail Sprint 4-5-L termina com módulo de consolidação (capstone ou simulado)', () => {
    for (const id of ALL) {
      if (id === 'trail48') continue; // módulo comparativo, sem capstone
      const t = CURRICULUM.find(tr => tr.id === id)!;
      const last = t.modules[t.modules.length - 1];
      const ok = last.slug.startsWith('capstone-') || last.slug.startsWith('simulado-');
      expect(ok, `${id} last=${last.slug}`).toBe(true);
    }
  });
});

describe('Sprint 4-5-L — Badges', () => {
  it.each(ALL.map(id => `${id}_done`))('badge %s existe', (badgeId) => {
    expect(BADGES_DEF.find(b => b.id === badgeId), badgeId).toBeDefined();
  });

  it('badge simulado_aws_sap existe', () => {
    expect(BADGES_DEF.find(b => b.id === 'simulado_aws_sap')).toBeDefined();
  });
});

describe('Sprint 4-5-L — Hubs', () => {
  it('IA inclui trail29 e trail30', () => {
    const hub = HUBS.find(h => h.slug === 'ia')!;
    expect(hub.trailIds).toContain('trail29');
    expect(hub.trailIds).toContain('trail30');
  });

  it('AWS inclui trail27 e trail28', () => {
    const hub = HUBS.find(h => h.slug === 'aws')!;
    expect(hub.trailIds).toContain('trail27');
    expect(hub.trailIds).toContain('trail28');
  });

  it('Engenharia inclui trail32 e trail40', () => {
    const hub = HUBS.find(h => h.slug === 'engenharia')!;
    expect(hub.trailIds).toContain('trail32');
    expect(hub.trailIds).toContain('trail40');
  });

  it('Programação inclui todas as linguagens 43-48', () => {
    const hub = HUBS.find(h => h.slug === 'programacao')!;
    for (const id of SPRINTL) {
      expect(hub.trailIds, `programacao deve ter ${id}`).toContain(id);
    }
  });

  it('novo Hub Construção agrupa trail31, 35, 37, 42', () => {
    const hub = HUBS.find(h => h.slug === 'construcao');
    expect(hub, 'hub construcao deve existir').toBeDefined();
    for (const id of ['trail31', 'trail35', 'trail37', 'trail42']) {
      expect(hub!.trailIds, `construcao deve ter ${id}`).toContain(id);
    }
  });
});

describe('Sprint 4-5-L — Integridade', () => {
  it('zero slug duplicado no currículo após Sprint 4-5-L', () => {
    const slugs = CURRICULUM.flatMap(t => t.modules.map(m => m.slug));
    const uniques = new Set(slugs);
    expect(uniques.size).toBe(slugs.length);
  });

  it('Trails Sprint 4-5-L têm seoDesc + keywords em TODOS os módulos', () => {
    for (const id of ALL) {
      const t = CURRICULUM.find(tr => tr.id === id)!;
      for (const m of t.modules) {
        expect(m.seoDesc, `${m.slug}.seoDesc`).toBeTruthy();
        expect(m.keywords, `${m.slug}.keywords`).toBeTruthy();
      }
    }
  });

  it('CURRICULUM tem >=45 trails após Sprint 4-5-L', () => {
    // 28 até Sprint 3B + 17 Sprint 4-5-L = 45 trails (+1 Rust em Sprint 6)
    expect(CURRICULUM.length).toBeGreaterThanOrEqual(45);
  });

  it('trail49 Rust Profissional existe com badge', () => {
    const t = CURRICULUM.find(tr => tr.id === 'trail49');
    expect(t, 'trail49 Rust deve existir').toBeDefined();
    expect(t!.name).toContain('Rust');
    expect(t!.modules.length).toBeGreaterThanOrEqual(8);
    expect(BADGES_DEF.find(b => b.id === 'trail49_done')).toBeDefined();
  });

  it('hrefs das novas trilhas são únicos', () => {
    const hrefs = ALL.map(id => CURRICULUM.find(t => t.id === id)!.href);
    const uniq = new Set(hrefs);
    expect(uniq.size).toBe(hrefs.length);
  });
});
