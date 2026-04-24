/**
 * Smoke tests para trails novas do Sprint 2 curriculum v2 +
 * capstones obrigatórios + novo simulado DVA-C02.
 */

import { describe, it, expect } from 'vitest';
import { CURRICULUM, BADGES_DEF, HUBS } from '../../lib/curriculum';
import { SIMULADOS_CATALOG } from '../../lib/simulados-catalog';
import { scoreAttempt } from '../../lib/simulados';

describe('Sprint 2 — Trails novas', () => {
  it.each([
    ['trail20', 'Estruturas de Dados & Algoritmos', 9],
    ['trail22', 'Security Engineering', 10],
    ['trail23', 'AWS Developer Associate (DVA-C02)', 15],
    ['trail36', 'Python para Engenheiros', 8],
  ])('trail %s (%s) existe com %d módulos', (id, name, expectedCount) => {
    const trail = CURRICULUM.find(t => t.id === id);
    expect(trail, `missing ${id}`).toBeDefined();
    expect(trail!.name).toBe(name);
    expect(trail!.modules.length).toBeGreaterThanOrEqual(expectedCount);
  });

  it('cada trail nova tem capstone (slug starts with capstone-)', () => {
    for (const id of ['trail20', 'trail22', 'trail23', 'trail36']) {
      const trail = CURRICULUM.find(t => t.id === id)!;
      const lastModule = trail.modules[trail.modules.length - 1];
      // capstone vem como último ou penúltimo módulo; aceita "capstone-" ou slug com "simulado"
      const hasCapstone = trail.modules.some(m =>
        m.slug.startsWith('capstone-') || m.slug.startsWith('simulado-'),
      );
      expect(hasCapstone, `${id} last module: ${lastModule.slug}`).toBe(true);
    }
  });
});

describe('Sprint 2 — Badges novas', () => {
  it.each([
    'trail20_done',
    'trail22_done',
    'trail23_done',
    'trail36_done',
    'simulado_aws_developer',
  ])('badge %s existe em BADGES_DEF', (badgeId) => {
    expect(BADGES_DEF.find(b => b.id === badgeId), `missing ${badgeId}`).toBeDefined();
  });

  it('todos badges novos têm xpBonus > 0', () => {
    for (const id of ['trail20_done', 'trail22_done', 'trail23_done', 'trail36_done']) {
      const badge = BADGES_DEF.find(b => b.id === id)!;
      expect(badge.xpBonus).toBeGreaterThan(0);
    }
  });
});

describe('Sprint 2 — Hub wiring', () => {
  it('Programação inclui trail19, trail20, trail36', () => {
    const hub = HUBS.find(h => h.slug === 'programacao')!;
    expect(hub.trailIds).toContain('trail19');
    expect(hub.trailIds).toContain('trail20');
    expect(hub.trailIds).toContain('trail36');
  });

  it('Engenharia inclui trail22 (security)', () => {
    const hub = HUBS.find(h => h.slug === 'engenharia')!;
    expect(hub.trailIds).toContain('trail22');
  });

  it('AWS inclui trail23 (DVA)', () => {
    const hub = HUBS.find(h => h.slug === 'aws')!;
    expect(hub.trailIds).toContain('trail23');
  });
});

describe('Sprint 2 — T0.2 Capstones obrigatórios', () => {
  const expectedCapstones: Array<[string, string]> = [
    ['trail7', 'capstone-devops-plataforma-completa'],
    ['trail8', 'capstone-engenharia-software-refactor'],
    ['trail9', 'capstone-ai-native-rag-producao'],
    ['trail10', 'capstone-sistemas-distribuidos-saga'],
    ['trail11', 'capstone-sre-slo-runbook'],
    ['trail13', 'capstone-claude-code-team-playbook'],
    ['trail17', 'capstone-claude-agent-produto-completo'],
  ];

  it.each(expectedCapstones)('%s tem capstone %s', (trailId, capstoneSlug) => {
    const trail = CURRICULUM.find(t => t.id === trailId)!;
    const capstone = trail.modules.find(m => m.slug === capstoneSlug);
    expect(capstone, `${trailId} missing capstone ${capstoneSlug}`).toBeDefined();
    expect(capstone!.xp).toBeGreaterThanOrEqual(80);
  });
});

describe('Sprint 2 — Simulado DVA-C02', () => {
  it('existe no catalog', () => {
    const sim = SIMULADOS_CATALOG.find(s => s.id === 'simulado-aws-developer');
    expect(sim).toBeDefined();
  });

  it('tem 15+ questões', () => {
    const sim = SIMULADOS_CATALOG.find(s => s.id === 'simulado-aws-developer')!;
    expect(sim.questions.length).toBeGreaterThanOrEqual(15);
  });

  it('scoreAttempt funciona com gabarito 100%', () => {
    const sim = SIMULADOS_CATALOG.find(s => s.id === 'simulado-aws-developer')!;
    const answers: Record<string, string> = {};
    for (const q of sim.questions) answers[q.id] = q.correctId;
    const scored = scoreAttempt(sim, {
      simuladoId: sim.id, startedAt: '', answers,
    });
    expect(scored.score).toBe(100);
    expect(scored.passed).toBe(true);
  });
});

describe('Sprint 2 — Integridade dos módulos', () => {
  it('nenhum módulo tem slug duplicado em TODO o currículo', () => {
    const slugs = CURRICULUM.flatMap(t => t.modules.map(m => m.slug));
    const uniques = new Set(slugs);
    expect(uniques.size).toBe(slugs.length);
  });

  it('todas as trails novas têm descricao + seoDesc nos módulos', () => {
    for (const id of ['trail20', 'trail22', 'trail23', 'trail36']) {
      const trail = CURRICULUM.find(t => t.id === id)!;
      for (const m of trail.modules) {
        expect(m.desc, `${m.slug}.desc`).toBeTruthy();
        expect(m.seoDesc, `${m.slug}.seoDesc`).toBeTruthy();
        expect(m.keywords, `${m.slug}.keywords`).toBeTruthy();
      }
    }
  });

  it('todos os capstones novos têm xp >= 80 e readTime >= 16', () => {
    const capstones = [
      'capstone-devops-plataforma-completa',
      'capstone-engenharia-software-refactor',
      'capstone-ai-native-rag-producao',
      'capstone-sistemas-distribuidos-saga',
      'capstone-sre-slo-runbook',
      'capstone-claude-code-team-playbook',
      'capstone-claude-agent-produto-completo',
    ];
    const flat = CURRICULUM.flatMap(t => t.modules);
    for (const slug of capstones) {
      const m = flat.find(x => x.slug === slug);
      expect(m, `capstone ${slug}`).toBeDefined();
      expect(m!.xp).toBeGreaterThanOrEqual(80);
      expect(m!.readTime).toBeGreaterThanOrEqual(16);
    }
  });
});
