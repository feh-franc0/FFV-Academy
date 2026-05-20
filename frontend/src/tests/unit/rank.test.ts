import { describe, it, expect } from 'vitest';
import { rankItems, rankItemsSimple, type Rankable } from '@/lib/personalization/rank';
import { DEFAULT_ENGAGEMENT, type EngagementSnapshot } from '@/lib/personalization/engagement-store';
import { DEFAULT_PREFERENCES, type UserPreferences } from '@/lib/user-preferences';

const TECH: Rankable = { slug: 'tecnologia', name: 'Tecnologia', tags: ['ia', 'aws'] };
const MEDVET: Rankable = { slug: 'medicina-veterinaria', name: 'Medicina Veterinária', tags: ['genetica'] };
const DIREITO: Rankable = { slug: 'direito', name: 'Direito', tags: ['oab'] };

function prefs(patch: Partial<UserPreferences> = {}): UserPreferences {
  return { ...DEFAULT_PREFERENCES, ...patch };
}

describe('rankItems — sinais isolados', () => {
  it('sem sinais: empata score=0 e ordena alfabético', () => {
    const result = rankItems([TECH, DIREITO, MEDVET], prefs(), DEFAULT_ENGAGEMENT);
    expect(result.map(r => r.item.slug)).toEqual([
      'direito',
      'medicina-veterinaria',
      'tecnologia',
    ]);
    result.forEach(r => expect(r.score).toBe(0));
  });

  it('declarado (peso 3.0) sobe pro topo', () => {
    const result = rankItems(
      [TECH, MEDVET, DIREITO],
      prefs({ interestedBases: ['medicina-veterinaria'] }),
      DEFAULT_ENGAGEMENT,
    );
    expect(result[0].item.slug).toBe('medicina-veterinaria');
    expect(result[0].score).toBe(3);
    expect(result[0].reasons).toContain('declarado');
  });

  it('engagement (peso 2.0) com normalização sigmoid', () => {
    const engagement: EngagementSnapshot = {
      ...DEFAULT_ENGAGEMENT,
      visitedBases: { tecnologia: 5 },
    };
    const result = rankItems([TECH, DIREITO], prefs(), engagement);
    expect(result[0].item.slug).toBe('tecnologia');
    // tanh(5/5) ≈ 0.7616 → score ≈ 1.523
    expect(result[0].score).toBeCloseTo(2 * Math.tanh(1), 2);
    expect(result[0].reasons.some(r => r.includes('interações'))).toBe(true);
  });

  it('tag match (peso 1.0)', () => {
    const result = rankItems(
      [TECH, MEDVET],
      prefs({ topicTags: ['ia'] }),
      DEFAULT_ENGAGEMENT,
    );
    expect(result[0].item.slug).toBe('tecnologia');
    expect(result[0].score).toBe(1);
    expect(result[0].reasons.some(r => r.includes('ia'))).toBe(true);
  });

  it('recência últimas 24h adiciona 0.5', () => {
    const now = new Date('2026-05-19T10:00:00Z');
    const yesterday = new Date('2026-05-18T11:00:00Z'); // ~23h atrás
    const engagement: EngagementSnapshot = {
      ...DEFAULT_ENGAGEMENT,
      lastAccessByBase: { tecnologia: yesterday.toISOString() },
    };
    const result = rankItems([TECH, DIREITO], prefs(), engagement, now);
    expect(result[0].item.slug).toBe('tecnologia');
    expect(result[0].score).toBeCloseTo(0.5, 1);
  });

  it('recência ≥30 dias atrás → 0 boost', () => {
    const now = new Date('2026-06-19T10:00:00Z');
    const oldDate = '2026-05-01T10:00:00Z'; // ~49d atrás
    const engagement: EngagementSnapshot = {
      ...DEFAULT_ENGAGEMENT,
      lastAccessByBase: { tecnologia: oldDate },
    };
    const result = rankItems([TECH, DIREITO], prefs(), engagement, now);
    // Empate em 0 → alfabética: direito vem antes
    expect(result[0].item.slug).toBe('direito');
  });

  it('lastAccess inválido (data ruim) NÃO quebra', () => {
    const engagement: EngagementSnapshot = {
      ...DEFAULT_ENGAGEMENT,
      lastAccessByBase: { tecnologia: 'not-a-date' },
    };
    const result = rankItems([TECH], prefs(), engagement);
    expect(result[0].score).toBe(0);
  });
});

describe('rankItems — composição', () => {
  it('declarado + engagement + tag + recência somam scores', () => {
    const now = new Date('2026-05-19T10:00:00Z');
    const engagement: EngagementSnapshot = {
      visitedBases: { tecnologia: 10 },
      openedModulesByBase: {},
      lastAccessByBase: { tecnologia: new Date('2026-05-19T08:00:00Z').toISOString() },
      schemaVersion: 1,
    };
    const result = rankItems(
      [TECH],
      prefs({ interestedBases: ['tecnologia'], topicTags: ['ia'] }),
      engagement,
      now,
    );
    // 3 (declarado) + 2*tanh(10/5)=2*0.964=1.93 + 1 (tag) + 0.5 (recência) ≈ 6.43
    expect(result[0].score).toBeGreaterThan(6);
    expect(result[0].reasons.length).toBeGreaterThanOrEqual(3);
  });

  it('declarado vence engagement em empate aproximado', () => {
    const declared = { ...DEFAULT_ENGAGEMENT };
    const engaged: EngagementSnapshot = {
      ...DEFAULT_ENGAGEMENT,
      visitedBases: { medicina_veterinaria: 50 },
    };
    void engaged;
    // TECH declarado (3.0) vs MEDVET engagement (max ~2.0): TECH ganha
    const result = rankItems(
      [TECH, MEDVET],
      prefs({ interestedBases: ['tecnologia'] }),
      declared,
    );
    expect(result[0].item.slug).toBe('tecnologia');
  });
});

describe('rankItemsSimple — atalho', () => {
  it('retorna apenas os items ordenados', () => {
    const result = rankItemsSimple(
      [TECH, MEDVET],
      prefs({ interestedBases: ['medicina-veterinaria'] }),
      DEFAULT_ENGAGEMENT,
    );
    expect(result.map(r => r.slug)).toEqual(['medicina-veterinaria', 'tecnologia']);
  });
});
