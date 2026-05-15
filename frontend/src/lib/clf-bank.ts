/**
 * Loader unificado do banco de questões CLF-C02 (AWS Cloud Practitioner).
 *
 * Carrega os 5 JSONs em `frontend/data/question-bank/clf-c02-*.json`, normaliza
 * para `SimuladoQuestion` e expõe helpers para sortear questões aleatórias com
 * distribuição weighted segundo o blueprint oficial.
 *
 * Blueprint oficial (AWS CLF-C02, set/2023, vigente em 2026-05):
 * - Cloud Concepts: 24%
 * - Security & Compliance: 30%
 * - Cloud Technology & Services: 34%
 * - Billing, Pricing & Support: 12%
 *
 * Schema rico de explicação ainda é opcional (alguns JSONs trazem `explanation`
 * como string simples). Os componentes consumidores fazem fallback gracioso.
 */

import type { SimuladoQuestion } from './simulados';

export type ClfBankSource = 'piloto' | 'security' | 'cloud-concepts' | 'tech' | 'billing';

export interface ClfBankEntry {
  source: ClfBankSource;
  questions: SimuladoQuestion[];
}

/**
 * Domínios oficiais do CLF-C02. Strings batem exatamente com o campo `domain`
 * dos JSONs do banco — não normalizar/trim para evitar mismatch silencioso.
 */
export const CLF_DOMAINS = [
  'Cloud Concepts',
  'Security & Compliance',
  'Cloud Technology & Services',
  'Billing, Pricing & Support',
] as const;

export type ClfDomain = (typeof CLF_DOMAINS)[number];

/** Pesos do blueprint oficial. Soma 100. */
export const CLF_DOMAIN_WEIGHTS: Record<ClfDomain, number> = {
  'Cloud Concepts': 24,
  'Security & Compliance': 30,
  'Cloud Technology & Services': 34,
  'Billing, Pricing & Support': 12,
};

// ─── JSON shape no disco ──────────────────────────────────────────────────

interface RawJsonQuestion {
  id: string;
  stem: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: unknown; // string OU objeto rico — não inspecionamos aqui
  topic?: string;
  domain?: string;
  difficulty?: string;
  scenarioType?: string;
  tags?: string[];
  references?: { title: string; url: string }[];
}

interface RawJsonBank {
  certification: string;
  questions: RawJsonQuestion[];
}

// ─── Loader ───────────────────────────────────────────────────────────────

/**
 * Carrega os 5 JSONs via import dinâmico (assert json).
 *
 * Em runtime de browser estes JSONs viram bundles JS estáticos (Next.js
 * inclui-os no build), então o `fetch`/`import()` é resolvido no momento do
 * code-splitting — não há requisição HTTP no client além do chunk JS.
 */
export async function loadClfBank(): Promise<ClfBankEntry[]> {
  const [piloto, security, cloudConcepts, tech, billing] = await Promise.all([
    import('../../data/question-bank/clf-c02-pilot-v1.json'),
    import('../../data/question-bank/clf-c02-security-v1.json'),
    import('../../data/question-bank/clf-c02-cloud-concepts-v1.json'),
    import('../../data/question-bank/clf-c02-tech-v1.json'),
    import('../../data/question-bank/clf-c02-billing-v1.json'),
  ]);

  return [
    { source: 'piloto', questions: normalize((piloto.default ?? piloto) as RawJsonBank) },
    { source: 'security', questions: normalize((security.default ?? security) as RawJsonBank) },
    { source: 'cloud-concepts', questions: normalize((cloudConcepts.default ?? cloudConcepts) as RawJsonBank) },
    { source: 'tech', questions: normalize((tech.default ?? tech) as RawJsonBank) },
    { source: 'billing', questions: normalize((billing.default ?? billing) as RawJsonBank) },
  ];
}

function normalize(bank: RawJsonBank): SimuladoQuestion[] {
  return bank.questions.map((q): SimuladoQuestion => ({
    id: q.id,
    stem: q.stem,
    options: q.options.map(o => ({ id: o.id as SimuladoQuestion['options'][number]['id'], text: o.text })),
    correctId: q.correctId as SimuladoQuestion['correctId'],
    // Passa explicação como veio — pode ser string ou objeto rico.
    // Tipo de SimuladoQuestion é `string`, então fazemos cast; o componente
    // detecta tipo em runtime com `typeof === 'string'`.
    explanation: q.explanation as unknown as string,
    topic: q.topic ?? q.domain ?? 'Geral',
    difficulty: (q.difficulty === 'easy' || q.difficulty === 'hard') ? q.difficulty : 'medium',
  }));
}

/** Achata todos os bancos numa única lista. Útil para sorteio cross-source. */
export function flattenBank(entries: ClfBankEntry[]): SimuladoQuestion[] {
  const seen = new Set<string>();
  const out: SimuladoQuestion[] = [];
  for (const entry of entries) {
    for (const q of entry.questions) {
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      out.push(q);
    }
  }
  return out;
}

// ─── Sorteio ──────────────────────────────────────────────────────────────

export interface PickOptions {
  domain?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Quando true, sorteia respeitando pesos do blueprint. Default false. */
  weightedByDomain?: boolean;
  /** Seed para sorteio determinístico (testes). */
  rng?: () => number;
  /** IDs que NÃO devem ser sorteados (ex: questões já vistas na sessão). */
  excludeIds?: ReadonlySet<string>;
}

/**
 * Sorteia até `count` questões do bank.
 *
 * Sem `weightedByDomain` → sorteio uniforme.
 * Com `weightedByDomain` → para cada slot, escolhe primeiro o domínio
 * proporcionalmente aos pesos do blueprint, depois sorteia uniforme dentro do
 * domínio. Garante distribuição esperada para sessão de estudo.
 */
export function pickRandomBatch(
  bank: SimuladoQuestion[],
  count: number,
  opts: PickOptions = {},
): SimuladoQuestion[] {
  const rng = opts.rng ?? Math.random;
  const exclude = opts.excludeIds ?? new Set<string>();

  let pool = bank.filter(q => !exclude.has(q.id));
  if (opts.domain) pool = pool.filter(q => q.topic === opts.domain);
  if (opts.difficulty) pool = pool.filter(q => q.difficulty === opts.difficulty);

  if (pool.length === 0 || count <= 0) return [];

  const picked: SimuladoQuestion[] = [];
  const pickedIds = new Set<string>();

  if (opts.weightedByDomain) {
    // Particiona pool por domínio
    const byDomain: Record<string, SimuladoQuestion[]> = {};
    for (const q of pool) {
      const d = q.topic;
      (byDomain[d] ??= []).push(q);
    }

    while (picked.length < count) {
      const domain = pickWeightedDomain(byDomain, rng);
      if (!domain) break;
      const candidates = byDomain[domain].filter(q => !pickedIds.has(q.id));
      if (candidates.length === 0) {
        // Esgotou esse domínio — remove e tenta novamente
        delete byDomain[domain];
        if (Object.keys(byDomain).length === 0) break;
        continue;
      }
      const chosen = candidates[Math.floor(rng() * candidates.length)];
      picked.push(chosen);
      pickedIds.add(chosen.id);
    }
    return picked;
  }

  // Sorteio uniforme (Fisher-Yates parcial)
  const indices = pool.map((_, i) => i);
  const take = Math.min(count, pool.length);
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(rng() * (indices.length - i));
    [indices[i], indices[j]] = [indices[j], indices[i]];
    picked.push(pool[indices[i]]);
  }
  return picked;
}

function pickWeightedDomain(
  byDomain: Record<string, SimuladoQuestion[]>,
  rng: () => number,
): string | null {
  const available = Object.keys(byDomain);
  if (available.length === 0) return null;

  // Soma pesos apenas dos domínios disponíveis (renormaliza)
  const weights = available.map(d => CLF_DOMAIN_WEIGHTS[d as ClfDomain] ?? 10);
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return available[Math.floor(rng() * available.length)];

  let r = rng() * total;
  for (let i = 0; i < available.length; i++) {
    r -= weights[i];
    if (r <= 0) return available[i];
  }
  return available[available.length - 1];
}
