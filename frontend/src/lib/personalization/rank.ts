/**
 * rank — função pura que ordena hubs/bases pelo perfil do usuário.
 *
 * Implementa o algoritmo descrito no PERSONALIZATION_PLAN_2026-05 §3.b:
 *
 *   score(item) =
 *     3.0 * (item declared as interest ? 1 : 0)            // declarado
 *   + 2.0 * normalize(visit_count or module_opens)         // inferido
 *   + 1.0 * (preferred material match ? 1 : 0)             // tipo
 *   + 0.5 * recencyBoost(lastAccess)                       // recência
 *
 * Ordem decrescente por score; empate alfabético (estabilidade).
 *
 * Função PURA — sem efeitos colaterais, totalmente testável.
 */

import type { UserPreferences } from '@/lib/user-preferences';
import type { EngagementSnapshot } from './engagement-store';

export interface Rankable {
  slug: string;
  /** Nome usado pra desempate alfabético. */
  name: string;
  /** Tags semânticas opcionais — comparadas com user.topicTags. */
  tags?: ReadonlyArray<string>;
}

export interface RankedItem<T extends Rankable> {
  item: T;
  score: number;
  reasons: string[]; // ex: ["declarado", "+3 visitas", "recente"]
}

/**
 * Normaliza contagem absoluta pra [0, 1] usando log+sigmoid suave.
 * 0 visits → 0; 1 → ~0.5; 5 → ~0.85; 20+ → ~0.97.
 */
function normalizeCount(count: number): number {
  if (count <= 0) return 0;
  // Sigmoid suave: sat em ~0.97 com 20 visitas
  return Math.tanh(count / 5);
}

/**
 * Recency boost: 1.0 se últimas 24h, decai linearmente até 0 em 30 dias.
 * Sem acesso ou data inválida → 0.
 */
function recencyBoost(lastIso: string | undefined, now: Date = new Date()): number {
  if (!lastIso) return 0;
  const last = new Date(lastIso).getTime();
  if (Number.isNaN(last)) return 0;
  const ageMs = now.getTime() - last;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays <= 1) return 1;
  if (ageDays >= 30) return 0;
  return 1 - (ageDays - 1) / 29;
}

const WEIGHT_DECLARED = 3.0;
const WEIGHT_ENGAGEMENT = 2.0;
const WEIGHT_TAG_MATCH = 1.0;
const WEIGHT_RECENCY = 0.5;

/**
 * Ranqueia uma lista de items (bases/hubs/módulos) por score personalizado.
 *
 * @param items lista de candidatos (sem ordem inicial)
 * @param prefs preferências do user
 * @param engagement snapshot de engagement (default = vazio)
 * @param now relógio injetável pra tests
 */
export function rankItems<T extends Rankable>(
  items: ReadonlyArray<T>,
  prefs: UserPreferences,
  engagement: EngagementSnapshot,
  now: Date = new Date(),
): RankedItem<T>[] {
  const declared = new Set(prefs.interestedBases);
  const tagSet = new Set(prefs.topicTags);

  const scored = items.map<RankedItem<T>>(item => {
    const reasons: string[] = [];
    let score = 0;

    // Sinal 1 — declarado (peso 3.0)
    if (declared.has(item.slug)) {
      score += WEIGHT_DECLARED;
      reasons.push('declarado');
    }

    // Sinal 2 — engajamento (peso 2.0)
    const visitCount = engagement.visitedBases[item.slug] ?? 0;
    const moduleCount = engagement.openedModulesByBase[item.slug] ?? 0;
    const engagementSignal = normalizeCount(visitCount + moduleCount);
    if (engagementSignal > 0) {
      score += WEIGHT_ENGAGEMENT * engagementSignal;
      reasons.push(`+${visitCount + moduleCount} interações`);
    }

    // Sinal 3 — tag match (peso 1.0)
    if (item.tags && item.tags.length > 0) {
      const matches = item.tags.filter(t => tagSet.has(t));
      if (matches.length > 0) {
        score += WEIGHT_TAG_MATCH;
        reasons.push(`tags ${matches.join(', ')}`);
      }
    }

    // Sinal 4 — recência (peso 0.5)
    const lastAccess = engagement.lastAccessByBase[item.slug];
    const recency = recencyBoost(lastAccess, now);
    if (recency > 0) {
      score += WEIGHT_RECENCY * recency;
      if (recency >= 0.9) reasons.push('acesso recente');
      else if (recency >= 0.5) reasons.push('acesso na semana');
    }

    return { item, score, reasons };
  });

  // Ordena por score desc, depois alfabético crescente (estabilidade)
  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name, 'pt-BR');
  });

  return scored;
}

/**
 * Atalho conveniente que só retorna os items ordenados (descarta score).
 */
export function rankItemsSimple<T extends Rankable>(
  items: ReadonlyArray<T>,
  prefs: UserPreferences,
  engagement: EngagementSnapshot,
  now: Date = new Date(),
): T[] {
  return rankItems(items, prefs, engagement, now).map(r => r.item);
}
