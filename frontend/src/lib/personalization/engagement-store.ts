/**
 * engagement-store — registro client-side de sinais de engajamento.
 *
 * Foundation pro ranker (rank.ts) + futuro envio em batch pro backend
 * (PR6 do PERSONALIZATION_PLAN_2026-05). V1: localStorage only.
 *
 * O que registramos:
 *   - `visitedBases`: contagem de vezes que o user abriu cada base
 *   - `openedModulesByBase`: contagem de módulos abertos por base
 *   - `lastAccessByBase`: timestamp ISO da última visita a cada base
 *
 * Privacidade: tudo fica no dispositivo. Sem PII. Quando o backend de
 * engagement events estiver pronto, o emit() vai também despachar via
 * fetch (fire-and-forget).
 */

import { z } from 'zod';

export interface EngagementSnapshot {
  /** Slugs de bases visitadas → contagem de visit_base events. */
  visitedBases: Record<string, number>;
  /** Slug → contagem de open_module events. */
  openedModulesByBase: Record<string, number>;
  /** Slug → ISO timestamp da última visita registrada. */
  lastAccessByBase: Record<string, string>;
  /** Schema version pra migrations futuras. */
  schemaVersion: number;
}

export const DEFAULT_ENGAGEMENT: EngagementSnapshot = {
  visitedBases: {},
  openedModulesByBase: {},
  lastAccessByBase: {},
  schemaVersion: 1,
};

const STORAGE_KEY = 'ffv_engagement_v1';

const Schema = z.object({
  visitedBases: z.record(z.string(), z.number().int().nonnegative()),
  openedModulesByBase: z.record(z.string(), z.number().int().nonnegative()),
  lastAccessByBase: z.record(z.string(), z.string()),
  schemaVersion: z.number().int(),
});

export function loadEngagement(): EngagementSnapshot {
  if (typeof window === 'undefined') return DEFAULT_ENGAGEMENT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ENGAGEMENT;
    return Schema.parse(JSON.parse(raw));
  } catch {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return DEFAULT_ENGAGEMENT;
  }
}

function saveEngagement(snapshot: EngagementSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // localStorage cheio / Safari privado — silenciamos
  }
}

/**
 * Tipos de evento que registramos. Mantém alinhado com o domínio do
 * backend de engagement (PERSONALIZATION_PLAN Fase 4) — quando o
 * endpoint vier, fazemos fire-and-forget POST com o mesmo shape.
 */
export type EngagementEvent =
  | { kind: 'visit_base'; baseSlug: string }
  | { kind: 'open_module'; baseSlug: string; moduleSlug: string };

/**
 * Aplica um evento ao snapshot e persiste. Idempotente em chave (várias
 * chamadas com o mesmo timestamp → contagem cresce, último acesso muda).
 *
 * Retorna o snapshot atualizado pra callers que queiram reagir.
 */
export function emit(event: EngagementEvent, now: Date = new Date()): EngagementSnapshot {
  const current = loadEngagement();
  const iso = now.toISOString();

  let next: EngagementSnapshot;
  switch (event.kind) {
    case 'visit_base': {
      next = {
        ...current,
        visitedBases: {
          ...current.visitedBases,
          [event.baseSlug]: (current.visitedBases[event.baseSlug] ?? 0) + 1,
        },
        lastAccessByBase: { ...current.lastAccessByBase, [event.baseSlug]: iso },
      };
      break;
    }
    case 'open_module': {
      next = {
        ...current,
        openedModulesByBase: {
          ...current.openedModulesByBase,
          [event.baseSlug]: (current.openedModulesByBase[event.baseSlug] ?? 0) + 1,
        },
        lastAccessByBase: { ...current.lastAccessByBase, [event.baseSlug]: iso },
      };
      break;
    }
  }
  saveEngagement(next);
  return next;
}

/** Reset total — usado em /preferencias quando user pede limpeza. */
export function clearEngagement(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
