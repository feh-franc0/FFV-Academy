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

import { getBaseSlugForModule, filterSlugsByBase, getModuleSlugSetForBase } from './module-base-resolver';
import { CURRICULUM } from '@/lib/curriculum';
import { MEDVET_MODULES_LITE } from '@/lib/bases/medvet/slugs';
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

/**
 * Total de módulos cadastrados numa base.
 *
 * Fonte de verdade: o `moduleToBase` em module-base-resolver.ts, que é
 * construído a partir do CURRICULUM + HUBS + MEDVET_MODULE_SLUGS. Assim,
 * basta uma base ter trilhas registradas em algum hub para o total
 * aparecer aqui — sem switch hardcoded por slug.
 *
 * Bases não-tech (carreira, comunicacao, marketing, conteudo,
 * empreendedorismo, ingles) entram automaticamente via essa mesma
 * derivação. Adicionar uma base nova não exige tocar este arquivo.
 */
export function selectTotalModulesForBase(baseSlug: string): number {
  return getModuleSlugSetForBase(baseSlug).size;
}

/** XP máximo possível somando todos os módulos de uma base. */
export function selectTotalXpForBase(baseSlug: string): number {
  if (baseSlug === 'medicina-veterinaria') {
    // Medvet modules don't have XP yet — estimar via tempo estimado * fator
    // ou retornar 0. Por ora 0, pra não mostrar denominador errado.
    return 0;
  }
  // Para qualquer base com módulos no CURRICULUM (tecnologia + 6 novas
  // bases profissionais), soma XP de cada módulo que pertence a ela.
  const baseSlugs = getModuleSlugSetForBase(baseSlug);
  if (baseSlugs.size === 0) return 0;
  let total = 0;
  for (const trail of CURRICULUM) {
    for (const m of trail.modules) {
      if (baseSlugs.has(m.slug)) total += m.xp;
    }
  }
  return total;
}

// ─── Counters por base (localStorage-based, sem mudar schema do GameState) ──
//
// O GameState.studyDays é flat e cross-base. Para que os widgets DENTRO de
// uma base (QuestPanel, pill "X/3" no HUD, /progresso) reflitam só a base
// ativa, mantemos contadores transient em localStorage chaveados por:
//
//     ffv_<metric>:<dateISO>:<baseSlug>      (counters diários)
//     ffv_<metric>:week-<weekStartISO>:<baseSlug>  (counters semanais)
//
// Métricas suportadas:
//   - review_count      → cards SRS revisados
//   - modules_completed → módulos marcados como completos
//   - xp_earned         → XP somado por completions/revisões
//
// Quem incrementa: useGameState.markComplete() e reviewOne()/rate().
//
// Por que localStorage e não banco: V1 de gamificação cliente-first. Quando
// migrarmos GameState pra Postgres, esses counters viram colunas em
// progress_per_base ou similar. Hoje localStorage é suficiente.

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** YYYY-MM-DD da segunda-feira da semana atual (UTC). */
function weekStartISO(): string {
  const d = new Date();
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function readCount(key: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(window.localStorage.getItem(key) ?? 0);
  } catch {
    return 0;
  }
}

function writeCount(key: string, value: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* storage bloqueado */
  }
}

function bumpCount(key: string, by = 1): void {
  writeCount(key, readCount(key) + by);
}

// ─── Cards SRS revisados ─────────────────────────────────────────────────

const REVIEW_COUNT_KEY_PREFIX = 'ffv_review_count';

function reviewCountKey(baseSlug: string, dateISO: string = todayISO()): string {
  return `${REVIEW_COUNT_KEY_PREFIX}:${dateISO}:${baseSlug}`;
}

/** Incrementa o contador de revisões de hoje pra base + marca atividade. */
export function bumpBaseReviewCount(baseSlug: string): void {
  bumpCount(reviewCountKey(baseSlug));
  // Espelha no contador semanal pra alimentar quest "Revise 15 cards essa semana".
  bumpCount(`ffv_review_count_week:${weekStartISO()}:${baseSlug}`);
  // Revisão conta como atividade do dia pra "Estude hoje pra manter streak".
  bumpBaseActivityToday(baseSlug);
}

/** Lê o contador de revisões de hoje pra base. */
export function getBaseReviewCountToday(baseSlug: string): number {
  return readCount(reviewCountKey(baseSlug));
}

/** Lê o contador de revisões da semana atual pra base. */
export function getBaseReviewCountThisWeek(baseSlug: string): number {
  return readCount(`ffv_review_count_week:${weekStartISO()}:${baseSlug}`);
}

// ─── Módulos completados por base+dia/semana ─────────────────────────────

const MODULES_DAY_KEY_PREFIX = 'ffv_modules_completed';
const MODULES_WEEK_KEY_PREFIX = 'ffv_modules_completed_week';

/**
 * Incrementa o contador de módulos completados hoje + nesta semana pra base.
 * Chamado por `useGameState.markComplete` quando o módulo pertence a uma base
 * identificável (via `getBaseSlugForModule`).
 */
export function bumpBaseModulesCompleted(baseSlug: string): void {
  bumpCount(`${MODULES_DAY_KEY_PREFIX}:${todayISO()}:${baseSlug}`);
  bumpCount(`${MODULES_WEEK_KEY_PREFIX}:${weekStartISO()}:${baseSlug}`);
}

export function getBaseModulesCompletedToday(baseSlug: string): number {
  return readCount(`${MODULES_DAY_KEY_PREFIX}:${todayISO()}:${baseSlug}`);
}

export function getBaseModulesCompletedThisWeek(baseSlug: string): number {
  return readCount(`${MODULES_WEEK_KEY_PREFIX}:${weekStartISO()}:${baseSlug}`);
}

// ─── XP ganho por base+semana (quest "Ganhe 500 XP esta semana") ────────

const XP_WEEK_KEY_PREFIX = 'ffv_xp_earned_week';
const XP_TOTAL_KEY_PREFIX = 'ffv_xp_total';

/**
 * Bump XP ganho na base. Atualiza simultaneamente:
 *   - bucket SEMANAL  (zera a cada segunda) → quest "Ganhe 500 XP esta semana"
 *   - bucket TOTAL    (cumulativo) → exibição "X XP nesta base" no HUD
 */
export function bumpBaseXPEarned(baseSlug: string, xp: number): void {
  if (xp <= 0) return;
  bumpCount(`${XP_WEEK_KEY_PREFIX}:${weekStartISO()}:${baseSlug}`, xp);
  bumpCount(`${XP_TOTAL_KEY_PREFIX}:${baseSlug}`, xp);
}

export function getBaseXPEarnedThisWeek(baseSlug: string): number {
  return readCount(`${XP_WEEK_KEY_PREFIX}:${weekStartISO()}:${baseSlug}`);
}

/**
 * XP total cumulativo (lifetime) na base.
 *
 * Fallback pra tech: usuários antes de 2026-05-21 acumularam tudo em tech
 * (única base até então) mas não tinham o counter. Se o counter está zero
 * e `baseSlug === DEFAULT_BASE_SLUG`, o caller pode preferir cair em
 * `state.xp` para preservar continuidade da exibição — esse fallback fica
 * no caller (HUD) porque precisa do GameState em mãos.
 */
export function getBaseXPTotal(baseSlug: string): number {
  return readCount(`${XP_TOTAL_KEY_PREFIX}:${baseSlug}`);
}

// ─── Streak por base (anti-vazamento) ────────────────────────────────────
//
// streak hoje é GLOBAL no GameState — decisão de produto pendente. Pra quest
// "Estude hoje pra manter a streak" DENTRO da base, criamos um proxy
// transiente: marcou-se atividade hoje (módulo completo OU card revisado)
// nesta base.

const ACTIVITY_DAY_KEY_PREFIX = 'ffv_activity';

export function bumpBaseActivityToday(baseSlug: string): void {
  writeCount(`${ACTIVITY_DAY_KEY_PREFIX}:${todayISO()}:${baseSlug}`, 1);
}

export function hasBaseActivityToday(baseSlug: string): boolean {
  return readCount(`${ACTIVITY_DAY_KEY_PREFIX}:${todayISO()}:${baseSlug}`) > 0;
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
    for (const m of MEDVET_MODULES_LITE) {
      if (!completed.has(m.slug)) {
        picks.push({
          slug: m.slug,
          title: m.title,
          href: `/medicina-veterinaria/${m.slug}`,
          xp: 0, // medvet modules sem XP — usar tempo estimado como proxy
          readTime: m.estimatedMin,
          trailName: 'Genética Veterinária',
          trailColor: '#8a9b7e', // sage accent default
          trailIcon: m.icon,
        });
        if (picks.length >= limit) return picks;
      }
    }
    return picks;
  }

  return picks;
}
