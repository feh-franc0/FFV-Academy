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

import { CURRICULUM, type Module } from './curriculum';
import { STORAGE_KEYS } from './constants';
import { getJSON, setJSON } from './storage';

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

/** Lista plana de todos os módulos do currículo (para indexação). */
function getAllModules(): Array<Module & { trailName: string; trailColor: string; trailHref?: string }> {
  const all: Array<Module & { trailName: string; trailColor: string; trailHref?: string }> = [];
  for (const trail of CURRICULUM) {
    for (const mod of trail.modules) {
      all.push({
        ...mod,
        trailName: trail.name,
        trailColor: trail.color,
        trailHref: trail.href,
      });
    }
  }
  return all;
}

/**
 * Pega o "módulo do dia". Sempre o mesmo pra todo mundo no mesmo dia.
 * Filtra módulos beginner/intermediate por padrão (módulos avançados não fazem sentido como "do dia").
 */
export function getDailyModule(opts?: { onlyBeginnerOrIntermediate?: boolean }): DailyModule | null {
  const all = getAllModules();
  if (all.length === 0) return null;

  const filtered = opts?.onlyBeginnerOrIntermediate
    ? all.filter(m => m.level !== 'advanced')
    : all;

  const pool = filtered.length > 0 ? filtered : all;
  const today = dateKey();
  const idx = hashString(today) % pool.length;
  const mod = pool[idx];

  const stored = getJSON<{ date: string; slug: string } | null>(STORAGE_KEYS.DAILY_MODULE, null);
  const completed = !!stored && stored.date === today && stored.slug === mod.slug;

  return {
    date: today,
    slug: mod.slug,
    title: mod.title,
    trailName: mod.trailName,
    trailColor: mod.trailColor,
    trailHref: mod.trailHref,
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
