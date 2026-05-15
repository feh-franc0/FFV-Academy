import { describe, it, expect } from 'vitest';
import {
  flattenBank,
  pickRandomBatch,
  CLF_DOMAIN_WEIGHTS,
  type ClfBankEntry,
} from '../clf-bank';
import type { SimuladoQuestion } from '../simulados';

function makeQuestion(id: string, domain: string, difficulty: SimuladoQuestion['difficulty'] = 'medium'): SimuladoQuestion {
  return {
    id,
    stem: `Stem ${id}`,
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' },
    ],
    correctId: 'A',
    explanation: 'exp',
    topic: domain,
    difficulty,
  };
}

/** RNG determinístico simples (Mulberry32). */
function seededRng(seed: number): () => number {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

describe('flattenBank', () => {
  it('agrega todos os JSONs em uma única lista', () => {
    const entries: ClfBankEntry[] = [
      { source: 'piloto', questions: [makeQuestion('a', 'Cloud Concepts')] },
      { source: 'security', questions: [makeQuestion('b', 'Security & Compliance')] },
    ];
    const flat = flattenBank(entries);
    expect(flat).toHaveLength(2);
    expect(flat.map(q => q.id).sort()).toEqual(['a', 'b']);
  });

  it('deduplica por id', () => {
    const entries: ClfBankEntry[] = [
      { source: 'piloto', questions: [makeQuestion('x', 'Cloud Concepts')] },
      { source: 'security', questions: [makeQuestion('x', 'Security & Compliance')] },
    ];
    expect(flattenBank(entries)).toHaveLength(1);
  });
});

describe('pickRandomBatch', () => {
  // Pool grande o suficiente para não esgotar nenhum domínio em sample de 2000
  const pool = [
    ...Array.from({ length: 500 }, (_, i) => makeQuestion(`cc-${i}`, 'Cloud Concepts')),
    ...Array.from({ length: 500 }, (_, i) => makeQuestion(`sec-${i}`, 'Security & Compliance')),
    ...Array.from({ length: 500 }, (_, i) => makeQuestion(`tech-${i}`, 'Cloud Technology & Services')),
    ...Array.from({ length: 500 }, (_, i) => makeQuestion(`bil-${i}`, 'Billing, Pricing & Support')),
  ];

  it('retorna lista vazia se count <= 0', () => {
    expect(pickRandomBatch(pool, 0)).toEqual([]);
  });

  it('respeita o tamanho do pool quando count > pool', () => {
    const tiny = [makeQuestion('only', 'Cloud Concepts')];
    expect(pickRandomBatch(tiny, 5)).toHaveLength(1);
  });

  it('filtra por domínio', () => {
    const picks = pickRandomBatch(pool, 10, { domain: 'Cloud Concepts' });
    expect(picks.every(q => q.topic === 'Cloud Concepts')).toBe(true);
  });

  it('filtra por difficulty', () => {
    const mixed = [
      makeQuestion('e1', 'Cloud Concepts', 'easy'),
      makeQuestion('m1', 'Cloud Concepts', 'medium'),
      makeQuestion('h1', 'Cloud Concepts', 'hard'),
    ];
    expect(pickRandomBatch(mixed, 5, { difficulty: 'easy' })).toEqual([mixed[0]]);
  });

  it('é determinístico com rng seedado', () => {
    const a = pickRandomBatch(pool, 5, { rng: seededRng(42) });
    const b = pickRandomBatch(pool, 5, { rng: seededRng(42) });
    expect(a.map(q => q.id)).toEqual(b.map(q => q.id));
  });

  it('respeita excludeIds', () => {
    const excluded = new Set(pool.slice(0, 80).map(q => q.id));
    const picks = pickRandomBatch(pool, 5, { excludeIds: excluded });
    expect(picks.every(q => !excluded.has(q.id))).toBe(true);
  });

  it('weightedByDomain aproxima distribuição do blueprint num lote grande', () => {
    const N = 1000;
    const rng = seededRng(7);
    const picks = pickRandomBatch(pool, N, { weightedByDomain: true, rng });
    const counts: Record<string, number> = {};
    for (const p of picks) counts[p.topic] = (counts[p.topic] ?? 0) + 1;

    // Tolerância ±10% (sample noise). Verifica que pelo menos a ordem dos pesos
    // se reflete e que cada domínio tem participação razoável.
    const total = picks.length;
    for (const [domain, weight] of Object.entries(CLF_DOMAIN_WEIGHTS)) {
      const expected = weight / 100;
      const actual = (counts[domain] ?? 0) / total;
      expect(Math.abs(actual - expected)).toBeLessThan(0.1);
    }
  });
});
