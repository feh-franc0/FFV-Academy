/**
 * Base-scoped state selectors
 *
 * Filtra slices do GameState pela base ativa. Permite que ProgressoClient,
 * ReviewClient, GameHUD etc. mostrem só conteúdo da base do usuário,
 * sem misturar tech e medvet.
 *
 * Princípios:
 * - Pura: zero side effects. Consome GameState (ou slices dele) + baseSlug,
 *   devolve dados filtrados.
 * - O resolver `getBaseSlugForModule` é a fonte de verdade do mapeamento.
 * - Slugs desconhecidos: default behavior é tratar como tech (DEFAULT_BASE_SLUG)
 *   pra retrocompatibilidade — usuário antigo que só tem progresso tech
 *   continua vendo tudo.
 */

import { getBaseSlugForModule, filterSlugsByBase } from './module-base-resolver';
import { CURRICULUM } from '@/lib/curriculum';
import { MEDVET_BASE } from '@/lib/bases/medvet';
import { DEFAULT_BASE_SLUG } from './registry';

// ─── Tipos de slices (re-definidos sem importar o engine pra evitar ciclos) ──

interface SlugBearing {
  slug: string;
}

interface CardLike {
  slug: string;
  dueDate?: string;
}

interface RecommendationLike {
  slug: string;
  title: string;
  href: string;
  xp: number;
  readTime: number;
  trailName: string;
  trailColor: string;
  trailIcon: string;
}

// ─── Selectors ───────────────────────────────────────────────────────────────

/** Filtra completedModules deixando só os da base ativa. */
export function selectCompletedForBase(completedModules: string[], baseSlug: string): string[] {
  return filterSlugsByBase(completedModules, baseSlug);
}

/** Conta cards SRS devidos da base ativa. */
export function selectDueCardsForBase<T extends CardLike>(dueCards: T[], baseSlug: string): T[] {
  const isDefault = baseSlug === DEFAULT_BASE_SLUG;
  return dueCards.filter(c => {
    const b = getBaseSlugForModule(c.slug);
    if (b === baseSlug) return true;
    if (isDefault && b === null) return true; // slug desconhecido vai pra default
    return false;
  });
}

/** Filtra reviewCards (todos, não só os devidos). */
export function selectReviewCardsForBase<T extends CardLike>(reviewCards: T[], baseSlug: string): T[] {
  return selectDueCardsForBase(reviewCards, baseSlug);
}

/** Devolve lastArticle SOMENTE se ele pertencer à base ativa. */
export function selectLastArticleForBase<T extends SlugBearing>(
  lastArticle: T | null | undefined,
  baseSlug: string
): T | null {
  if (!lastArticle) return null;
  const b = getBaseSlugForModule(lastArticle.slug);
  if (b === baseSlug) return lastArticle;
  if (baseSlug === DEFAULT_BASE_SLUG && b === null) return lastArticle;
  return null;
}

/** Filtra bookmarks da base ativa. */
export function selectBookmarksForBase(bookmarks: string[], baseSlug: string): string[] {
  return filterSlugsByBase(bookmarks, baseSlug);
}

/** Filtra quizScores deixando só os de módulos da base ativa. */
export function selectQuizScoresForBase<V>(
  quizScores: Record<string, V>,
  baseSlug: string
): Record<string, V> {
  const out: Record<string, V> = {};
  const isDefault = baseSlug === DEFAULT_BASE_SLUG;
  for (const [slug, v] of Object.entries(quizScores)) {
    const b = getBaseSlugForModule(slug);
    if (b === baseSlug || (isDefault && b === null)) {
      out[slug] = v;
    }
  }
  return out;
}

// ─── Catalog selectors ──────────────────────────────────────────────────────
//
// Retornam totais (denominadores) da base — quantos módulos totais existem,
// XP máximo, etc. Usado pra "X de Y" stats.

/** Total de módulos cadastrados numa base. */
export function selectTotalModulesForBase(baseSlug: string): number {
  if (baseSlug === 'tecnologia') {
    return CURRICULUM.reduce((acc, t) => acc + t.modules.length, 0);
  }
  if (baseSlug === 'medicina-veterinaria') {
    return MEDVET_BASE.trails.reduce((acc, t) => acc + t.modules.length, 0);
  }
  return 0;
}

/** XP máximo possível somando todos os módulos de uma base. */
export function selectTotalXpForBase(baseSlug: string): number {
  if (baseSlug === 'tecnologia') {
    return CURRICULUM.reduce(
      (acc, t) => acc + t.modules.reduce((a, m) => a + m.xp, 0),
      0
    );
  }
  // Medvet modules don't have XP yet — estimar via tempo estimado * fator
  // ou retornar 0. Por ora 0, pra não mostrar denominador errado.
  return 0;
}

// ─── Daily review counter per base (localStorage-based, sem mudar schema) ───
//
// O GameState.studyDays é flat e cross-base. Pra que a pílula "0/3" no GameHUD
// e o todayReviewCount em /progresso reflitam só a base ativa, mantemos um
// contador transient em localStorage chaveado por dia + base.

const REVIEW_COUNT_KEY_PREFIX = 'ffv_review_count';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function reviewCountKey(baseSlug: string, dateISO: string = todayISO()): string {
  return `${REVIEW_COUNT_KEY_PREFIX}:${dateISO}:${baseSlug}`;
}

/** Incrementa o contador de revisões de hoje pra base. Chama quando o usuário rateia um card. */
export function bumpBaseReviewCount(baseSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = reviewCountKey(baseSlug);
    const current = Number(window.localStorage.getItem(key) ?? 0);
    window.localStorage.setItem(key, String(current + 1));
  } catch {
    /* storage bloqueado */
  }
}

/** Lê o contador de revisões de hoje pra base. */
export function getBaseReviewCountToday(baseSlug: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(window.localStorage.getItem(reviewCountKey(baseSlug)) ?? 0);
  } catch {
    return 0;
  }
}

// ─── Recommendations base-aware ─────────────────────────────────────────────

/**
 * Gera recomendações de próximos módulos especificamente para a base ativa.
 * Pesca de tech CURRICULUM ou medvet trails dependendo do baseSlug.
 *
 * Para tech: lógica original (trilhas mais progredidas primeiro).
 * Para medvet: próximos módulos da trilha mais progredida.
 */
export function selectRecommendationsForBase(
  completedModules: string[],
  baseSlug: string,
  limit = 3
): RecommendationLike[] {
  const completed = new Set(completedModules);
  const picks: RecommendationLike[] = [];

  if (baseSlug === 'tecnologia') {
    const trailsByProgress = CURRICULUM
      .map(t => ({
        trail: t,
        done: t.modules.filter(m => completed.has(m.slug)).length,
        total: t.modules.length,
      }))
      .filter(t => t.done < t.total)
      .sort((a, b) => b.done / b.total - a.done / a.total);

    for (const { trail } of trailsByProgress) {
      for (const m of trail.modules) {
        if (!completed.has(m.slug)) {
          picks.push({
            slug: m.slug,
            title: m.title,
            href: `/aprenda/${m.slug}`,
            xp: m.xp,
            readTime: m.readTime,
            trailName: trail.name,
            trailColor: trail.color,
            trailIcon: trail.icon,
          });
          if (picks.length >= limit) return picks;
        }
      }
    }
    return picks;
  }

  if (baseSlug === 'medicina-veterinaria') {
    for (const trail of MEDVET_BASE.trails) {
      for (const m of trail.modules) {
        if (!completed.has(m.slug)) {
          picks.push({
            slug: m.slug,
            title: m.title,
            href: `/medicina-veterinaria/${m.slug}`,
            xp: 0, // medvet modules sem XP — usar tempo estimado como proxy
            readTime: m.estimatedMin ?? 10,
            trailName: trail.title,
            trailColor: '#8a9b7e', // sage accent default
            trailIcon: trail.icon,
          });
          if (picks.length >= limit) return picks;
        }
      }
    }
    return picks;
  }

  return picks;
}
