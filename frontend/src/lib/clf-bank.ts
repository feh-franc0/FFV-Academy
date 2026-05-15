/**
 * Loader unificado do banco de questões CLF-C02 (AWS Cloud Practitioner).
 *
 * Busca questões do backend via API (banco Postgres). Fallback para JSON estático
 * quando a API não está disponível (desenvolvimento local sem backend).
 *
 * Blueprint oficial (AWS CLF-C02, set/2023, vigente em 2026-05):
 * - Cloud Concepts: 24%
 * - Security & Compliance: 30%
 * - Cloud Technology & Services: 34%
 * - Billing, Pricing & Support: 12%
 */

import type { SimuladoQuestion, OptionId } from './simulados';

export type ClfBankSource = 'piloto' | 'security' | 'cloud-concepts' | 'tech' | 'billing';

export interface ClfBankEntry {
  source: ClfBankSource;
  questions: SimuladoQuestion[];
}

export const CLF_DOMAINS = [
  'Cloud Concepts',
  'Security & Compliance',
  'Cloud Technology & Services',
  'Billing, Pricing & Support',
] as const;

export type ClfDomain = (typeof CLF_DOMAINS)[number];

export const CLF_DOMAIN_WEIGHTS: Record<ClfDomain, number> = {
  'Cloud Concepts': 24,
  'Security & Compliance': 30,
  'Cloud Technology & Services': 34,
  'Billing, Pricing & Support': 12,
};

// ─── API response shape ───────────────────────────────────────────────────

interface APIQuestion {
  id: string;
  simuladoId: string;
  stem: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: unknown;
  topic: string;
  domain: string;
  difficulty: string;
  scenarioType?: string;
  tags?: string[];
  source?: string;
  status: string;
}

interface APIQuestionsResponse {
  questions: APIQuestion[];
  total: number;
}

// ─── Fallback JSON shape ──────────────────────────────────────────────────

interface RawJsonQuestion {
  id: string;
  stem: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: unknown;
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

// ─── Normalize ────────────────────────────────────────────────────────────

function normalizeAPIQuestion(q: APIQuestion): SimuladoQuestion {
  return {
    id: q.id,
    stem: q.stem,
    options: q.options.map(o => ({ id: o.id as OptionId, text: o.text })),
    correctId: q.correctId as OptionId,
    explanation: q.explanation as unknown as string,
    topic: q.topic ?? q.domain ?? 'Geral',
    difficulty: (q.difficulty === 'easy' || q.difficulty === 'hard') ? q.difficulty : 'medium',
  };
}

function normalizeJsonQuestion(q: RawJsonQuestion): SimuladoQuestion {
  return {
    id: q.id,
    stem: q.stem,
    options: q.options.map(o => ({ id: o.id as OptionId, text: o.text })),
    correctId: q.correctId as OptionId,
    explanation: q.explanation as unknown as string,
    topic: q.topic ?? q.domain ?? 'Geral',
    difficulty: (q.difficulty === 'easy' || q.difficulty === 'hard') ? q.difficulty : 'medium',
  };
}

// ─── Loader ───────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/**
 * Carrega questões CLF do backend. Retorna lista achata (não por source).
 * Faz paginação interna para buscar até 1000 questões.
 */
async function loadFromAPI(): Promise<SimuladoQuestion[]> {
  const pageSize = 200;
  const pages: APIQuestion[] = [];
  let offset = 0;
  let total = Infinity;

  while (pages.length < total) {
    const url = `${API_BASE}/api/v1/admin/questions?simulado_id=aws-clf&status=active&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data: APIQuestionsResponse = await res.json();
    total = data.total;
    pages.push(...data.questions);
    offset += pageSize;
    if (data.questions.length < pageSize) break;
  }

  return pages.map(normalizeAPIQuestion);
}

/**
 * Fallback: carrega dos JSONs estáticos bundlados (quando backend não disponível).
 */
async function loadFromJSON(): Promise<SimuladoQuestion[]> {
  const [piloto, security, securityV2, cloudConcepts, cloudConceptsV2, tech, techV2, billing, billingV2] = await Promise.all([
    import('../../data/question-bank/clf-c02-pilot-v1.json'),
    import('../../data/question-bank/clf-c02-security-v1.json'),
    import('../../data/question-bank/clf-c02-security-v2.json'),
    import('../../data/question-bank/clf-c02-cloud-concepts-v1.json'),
    import('../../data/question-bank/clf-c02-cloud-concepts-v2.json'),
    import('../../data/question-bank/clf-c02-tech-v1.json'),
    import('../../data/question-bank/clf-c02-tech-v2.json'),
    import('../../data/question-bank/clf-c02-billing-v1.json'),
    import('../../data/question-bank/clf-c02-billing-v2.json'),
  ]);

  const all = [piloto, security, securityV2, cloudConcepts, cloudConceptsV2, tech, techV2, billing, billingV2]
    .map(m => (m.default ?? m) as RawJsonBank)
    .flatMap(bank => bank.questions.map(normalizeJsonQuestion));

  const seen = new Set<string>();
  return all.filter(q => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

let _bankCache: SimuladoQuestion[] | null = null;

/**
 * Carrega o banco CLF completo. Tenta API primeiro, fallback para JSON.
 * Resultado é cacheado na sessão (memória do bundle).
 */
export async function loadClfBankFlat(): Promise<SimuladoQuestion[]> {
  if (_bankCache) return _bankCache;

  if (API_BASE) {
    try {
      const questions = await loadFromAPI();
      if (questions.length > 0) {
        _bankCache = questions;
        return questions;
      }
    } catch {
      // API indisponível — usa fallback JSON
    }
  }

  const questions = await loadFromJSON();
  _bankCache = questions;
  return questions;
}

/**
 * Compatibilidade com código legado que espera ClfBankEntry[].
 * Internamente usa loadClfBankFlat().
 */
export async function loadClfBank(): Promise<ClfBankEntry[]> {
  const questions = await loadClfBankFlat();
  // Agrupa por domínio para manter compatibilidade de interface
  const bySource = new Map<ClfBankSource, SimuladoQuestion[]>([
    ['piloto', []],
    ['security', []],
    ['cloud-concepts', []],
    ['tech', []],
    ['billing', []],
  ]);

  for (const q of questions) {
    const domain = q.topic;
    if (domain.includes('Security') || domain.includes('Compliance')) {
      bySource.get('security')!.push(q);
    } else if (domain.includes('Cloud Concepts') || domain.includes('Cloud C')) {
      bySource.get('cloud-concepts')!.push(q);
    } else if (domain.includes('Technology') || domain.includes('Services')) {
      bySource.get('tech')!.push(q);
    } else if (domain.includes('Billing') || domain.includes('Pricing') || domain.includes('Support')) {
      bySource.get('billing')!.push(q);
    } else {
      bySource.get('piloto')!.push(q);
    }
  }

  return Array.from(bySource.entries()).map(([source, qs]) => ({ source, questions: qs }));
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
  weightedByDomain?: boolean;
  rng?: () => number;
  excludeIds?: ReadonlySet<string>;
}

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
