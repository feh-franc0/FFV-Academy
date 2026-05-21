'use client';

/**
 * Módulo do Dia — desafio diário compartilhado.
 *
 * Hash determinístico (data → slug) garante que TODOS veem o mesmo módulo
 * no mesmo dia. Cria ritual de "todos estão fazendo o mesmo desafio hoje".
 *
 * Diferente do `getDailyChallenge` (que é card SRS aleatório, requer histórico),
 * este funciona pra qualquer usuário (incluindo first-timers).
 *
 * Combinação ideal:
 * - First-timer / sem cards SRS → DailyModule (aprende algo novo)
 * - Usuário com cards SRS → DailyChallenge SRS (revisa com 3x XP)
 */

import { STORAGE_KEYS } from './constants';
import { getJSON, setJSON } from './storage';
import { DEFAULT_BASE_SLUG } from './bases/registry';
import { getAllModulesForBase, type BaseModuleSummary } from './bases/all-modules';

export interface DailyModule {
  date: string;          // YYYY-MM-DD
  slug: string;
  title: string;
  trailName: string;
  trailColor: string;
  trailHref?: string;
  xp: number;
  readTime: number;
  bonusXp: number;       // bônus por completar no mesmo dia
  completed: boolean;
}

/** Hash determinístico simples (não-criptográfico). Aceita string, retorna inteiro. */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** YYYY-MM-DD em UTC (consistente entre timezones). */
function dateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Pega o "módulo do dia" para a base ativa. Mesmo módulo pra todo mundo no
 * mesmo dia DENTRO da mesma base. Antes da correção (2026-05-21), medvet
 * via "AWS Cloud Practitioner" porque o pool era global; agora o pool vem
 * de `getAllModulesForBase`, que sabe medvet+tech+futuras.
 *
 * Filtra módulos beginner/intermediate por padrão — bases sem `level`
 * (medvet hoje) caem no pool inteiro.
 *
 * Retorna `null` se a base não tem módulos cadastrados (queued bases).
 */
export function getDailyModule(opts?: { onlyBeginnerOrIntermediate?: boolean; baseSlug?: string }): DailyModule | null {
  const baseSlug = opts?.baseSlug ?? DEFAULT_BASE_SLUG;
  const inBase: BaseModuleSummary[] = getAllModulesForBase(baseSlug);
  if (inBase.length === 0) return null;

  const filtered = opts?.onlyBeginnerOrIntermediate
    ? inBase.filter(m => m.level !== 'advanced')
    : inBase;

  const pool = filtered.length > 0 ? filtered : inBase;
  const today = dateKey();
  // Hash inclui o baseSlug pra cada base ter seu próprio "módulo do dia"
  // (não compartilhamos índice entre bases — slugs diferentes, pools diferentes).
  const idx = hashString(`${today}:${baseSlug}`) % pool.length;
  const mod = pool[idx];

  const stored = getJSON<{ date: string; slug: string } | null>(STORAGE_KEYS.DAILY_MODULE, null);
  const completed = !!stored && stored.date === today && stored.slug === mod.slug;

  return {
    date: today,
    slug: mod.slug,
    title: mod.title,
    trailName: mod.trailName,
    trailColor: mod.trailColor,
    // trailHref descontinuado nesta refatoração — DailyModuleCard usa
    // /aprenda/<slug> ou /{base}/<slug> direto via mod.href quando precisar.
    xp: mod.xp,
    readTime: mod.readTime,
    bonusXp: 25, // bônus fixo por completar no dia
    completed,
  };
}

/** Marca o módulo do dia como completado (chamar quando user completa o módulo). */
export function markDailyModuleCompleted(slug: string): void {
  const today = dateKey();
  const daily = getDailyModule();
  if (daily?.slug === slug) {
    setJSON(STORAGE_KEYS.DAILY_MODULE, { date: today, slug });
  }
}

/** Retorna se um slug é o módulo do dia. Útil pra UI mostrar bônus. */
export function isDailyModule(slug: string): boolean {
  const daily = getDailyModule();
  return daily?.slug === slug;
}
