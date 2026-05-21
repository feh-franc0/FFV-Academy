'use client';

import type { GameState } from './engine';
import {
  getBaseReviewCountToday,
  getBaseReviewCountThisWeek,
  getBaseModulesCompletedToday,
  getBaseModulesCompletedThisWeek,
  getBaseXPEarnedThisWeek,
  hasBaseActivityToday,
} from './bases/state-selectors';
import { DEFAULT_BASE_SLUG } from './bases/registry';

export type QuestPeriod = 'daily' | 'weekly';

export interface QuestDef {
  id: string;
  period: QuestPeriod;
  title: string;
  desc: string;
  icon: string;
  xpReward: number;
  check: (state: GameState, today: string, weekStart: string) => boolean;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekStartISO(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export const QUEST_DEFS: QuestDef[] = [
  {
    id: 'daily_complete_module',
    period: 'daily',
    title: 'Complete um módulo hoje',
    desc: 'Leia e complete qualquer artigo da plataforma.',
    icon: '📖',
    xpReward: 25,
    check(state, today) {
      const studyDay = state.studyDays.find(d => d.date === today);
      return (studyDay?.modulesCompleted ?? 0) >= 1;
    },
  },
  {
    id: 'daily_review_3',
    period: 'daily',
    title: 'Revise 3 flashcards',
    desc: 'Complete 3 revisões de SRS no dia.',
    icon: '🃏',
    xpReward: 15,
    check(state, today) {
      const studyDay = state.studyDays.find(d => d.date === today);
      return (studyDay?.cardsReviewed ?? 0) >= 3;
    },
  },
  {
    id: 'daily_streak',
    period: 'daily',
    title: 'Mantenha o streak',
    desc: 'Estude qualquer coisa hoje para não quebrar o streak.',
    icon: '🔥',
    xpReward: 10,
    check(state, today) {
      return state.lastStudyDate === today;
    },
  },
  {
    id: 'weekly_5_modules',
    period: 'weekly',
    title: 'Complete 5 módulos essa semana',
    desc: 'Complete pelo menos 5 artigos em 7 dias.',
    icon: '🎯',
    xpReward: 100,
    check(state, _today, weekStart) {
      const count = state.studyDays
        .filter(d => d.date >= weekStart)
        .reduce((acc, d) => acc + d.modulesCompleted, 0);
      return count >= 5;
    },
  },
  {
    id: 'weekly_perfect_quiz',
    period: 'weekly',
    title: 'Tire 100% em um quiz essa semana',
    desc: 'Complete um quiz com todas as respostas corretas.',
    icon: '⭐',
    xpReward: 75,
    check(state) {
      return Object.values(state.quizScores).some(s => s.perfect);
    },
  },
  {
    id: 'weekly_review_15',
    period: 'weekly',
    title: 'Revise 15 flashcards essa semana',
    desc: 'Mantenha o ritmo SRS — revisão espaçada é ciência.',
    icon: '🧠',
    xpReward: 60,
    check(state, _today, weekStart) {
      const count = state.studyDays
        .filter(d => d.date >= weekStart)
        .reduce((acc, d) => acc + d.cardsReviewed, 0);
      return count >= 15;
    },
  },
];

export interface QuestStatus {
  def: QuestDef;
  completed: boolean;
  completedAt?: string;
  alreadyClaimed: boolean;
}

export function getQuestStatuses(state: GameState): QuestStatus[] {
  const today = todayISO();
  const weekStart = weekStartISO();

  return QUEST_DEFS.map(def => {
    const list = def.period === 'daily' ? state.quests.daily : state.quests.weekly;
    const resetKey = def.period === 'daily' ? today : weekStart;
    const claimed = list.find(q => q.id === def.id && q.completedAt.slice(0, resetKey.length) === resetKey);
    const done = claimed ? true : def.check(state, today, weekStart);
    return {
      def,
      completed: done,
      completedAt: claimed?.completedAt,
      alreadyClaimed: !!claimed,
    };
  });
}

export function claimQuest(state: GameState, questId: string): GameState {
  const def = QUEST_DEFS.find(q => q.id === questId);
  if (!def) return state;
  const list = def.period === 'daily' ? state.quests.daily : state.quests.weekly;
  const already = list.some(q => q.id === questId);
  if (already) return state;
  const entry = { id: questId, completedAt: new Date().toISOString() };
  const newList = [...list, entry];
  return {
    ...state,
    xp: state.xp + def.xpReward,
    quests: {
      daily: def.period === 'daily' ? newList : state.quests.daily,
      weekly: def.period === 'weekly' ? newList : state.quests.weekly,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// Novo sistema: Quest + QuestProgress (com questsClaimedAt)
// ─────────────────────────────────────────────────────────────────

export interface Quest {
  id: string;
  type: 'daily' | 'weekly';
  icon: string;
  title: string;
  description: string;
  xpReward: number;
  target: number;
  /**
   * Caminho da AÇÃO da quest — pra onde o usuário vai pra cumprir.
   * Aceita placeholder `{base}` que é trocado pelo basePath da base ativa
   * em tempo de render (ver `getQuestActionHref`).
   *
   * Convenção:
   *   - Estudar/completar módulo  → `{base}` (volta pra home da base, lá ele escolhe)
   *   - Revisar cards SRS         → `/revisar` (rota global, escopa internamente)
   *   - Manter streak             → `{base}` (qualquer atividade na base conta)
   *   - Ganhar XP                 → `{base}` (idem)
   *   - Quiz perfeito             → `{base}` (módulo de quiz)
   */
  actionHref: string;
}

export interface QuestProgress {
  quest: Quest;
  current: number;
  completed: boolean;
  claimed: boolean;
}

const QUESTS: Quest[] = [
  {
    id: 'daily-module',
    type: 'daily',
    icon: '📖',
    title: 'Complete 1 módulo hoje',
    description: 'Leia e complete qualquer artigo da plataforma.',
    xpReward: 50,
    target: 1,
    actionHref: '{base}',
  },
  {
    id: 'daily-review',
    type: 'daily',
    icon: '🃏',
    title: 'Revise 3 cards',
    description: 'Complete 3 revisões de SRS no dia.',
    xpReward: 30,
    target: 3,
    actionHref: '/revisar',
  },
  {
    id: 'daily-streak',
    type: 'daily',
    icon: '🔥',
    title: 'Estude hoje para manter a streak',
    description: 'Qualquer atividade de estudo conta para o streak.',
    xpReward: 25,
    target: 1,
    actionHref: '{base}',
  },
  {
    id: 'weekly-modules',
    type: 'weekly',
    icon: '🎯',
    title: 'Complete 5 módulos esta semana',
    description: 'Complete pelo menos 5 artigos em 7 dias.',
    xpReward: 200,
    target: 5,
    actionHref: '{base}',
  },
  {
    id: 'weekly-xp',
    type: 'weekly',
    icon: '⚡',
    title: 'Ganhe 500 XP esta semana',
    description: 'Acumule 500 XP através de módulos e revisões.',
    xpReward: 150,
    target: 500,
    actionHref: '{base}',
  },
  {
    id: 'weekly-review',
    type: 'weekly',
    icon: '🧠',
    title: 'Revise 15 cards',
    description: 'Revisão espaçada é ciência — mantenha o ritmo.',
    xpReward: 100,
    target: 15,
    actionHref: '/revisar',
  },
];

/**
 * Resolve `{base}` para o basePath da base ativa.
 * Quando a quest é global (ex.: /revisar), retorna o href cru.
 */
export function getQuestActionHref(quest: Quest, basePath: string): string {
  if (!quest.actionHref) return basePath;
  return quest.actionHref.replace('{base}', basePath);
}

/**
 * Calcula `current` de cada quest ESCOPADO à base ativa.
 *
 * Antes (até 2026-05-21): lia state.studyDays direto, que é cross-base.
 * Quest "Complete 5 módulos esta semana" mostrava 4/5 em medvet mesmo
 * quando o usuário só tinha feito módulos de tech — produto mentindo.
 *
 * Agora: lê counters chaveados por base+dia/semana mantidos via
 * `useGameState.markComplete` (módulos) e `ReviewClient.rate` (cards).
 * Quando `baseSlug` é a default (tech) E não há counter (usuário antigo
 * pré-refatoração), faz fallback para state.studyDays — preserva retro-
 * compat e não zera quest progress de quem já estava na plataforma.
 */
function getCurrentForQuest(
  quest: Quest,
  state: GameState,
  today: string,
  weekStart: string,
  baseSlug: string,
): number {
  const studyDay = state.studyDays.find(d => d.date === today);
  const weekDays = state.studyDays.filter(d => d.date >= weekStart);

  if (quest.type === 'daily') {
    if (quest.id === 'daily-module') {
      const baseCount = getBaseModulesCompletedToday(baseSlug);
      // Fallback: usuário antigo sem counters por base, ainda em tech.
      if (baseCount === 0 && baseSlug === DEFAULT_BASE_SLUG) {
        return studyDay?.modulesCompleted ?? 0;
      }
      return baseCount;
    }
    if (quest.id === 'daily-review') {
      const baseCount = getBaseReviewCountToday(baseSlug);
      if (baseCount === 0 && baseSlug === DEFAULT_BASE_SLUG) {
        return studyDay?.cardsReviewed ?? 0;
      }
      return baseCount;
    }
    if (quest.id === 'daily-streak') {
      // "Estude hoje" — qualquer atividade NA BASE conta.
      // Fallback default: streak global (compatibilidade tech).
      if (hasBaseActivityToday(baseSlug)) return 1;
      if (baseSlug === DEFAULT_BASE_SLUG && state.lastStudyDate === today) return 1;
      return 0;
    }
    return 0;
  }

  // weekly
  if (quest.id === 'weekly-modules') {
    const baseCount = getBaseModulesCompletedThisWeek(baseSlug);
    if (baseCount === 0 && baseSlug === DEFAULT_BASE_SLUG) {
      return weekDays.reduce((acc, d) => acc + d.modulesCompleted, 0);
    }
    return baseCount;
  }
  if (quest.id === 'weekly-xp') {
    const baseXP = getBaseXPEarnedThisWeek(baseSlug);
    if (baseXP === 0 && baseSlug === DEFAULT_BASE_SLUG) {
      return weekDays.reduce((acc, d) => acc + d.xpEarned, 0);
    }
    return baseXP;
  }
  if (quest.id === 'weekly-review') {
    const baseCount = getBaseReviewCountThisWeek(baseSlug);
    if (baseCount === 0 && baseSlug === DEFAULT_BASE_SLUG) {
      return weekDays.reduce((acc, d) => acc + d.cardsReviewed, 0);
    }
    return baseCount;
  }
  return 0;
}

function isQuestClaimed(quest: Quest, claimedAt: Record<string, string>, today: string, weekStart: string): boolean {
  const ts = claimedAt[quest.id];
  if (!ts) return false;
  const claimedDate = ts.slice(0, 10); // YYYY-MM-DD
  if (quest.type === 'daily') return claimedDate === today;
  // weekly: claimedDate >= weekStart
  return claimedDate >= weekStart;
}

/**
 * Calcula o progresso das quests para uma base específica.
 *
 * `baseSlug` é obrigatório: quest é exibida DENTRO da home da base, então
 * counters são por base. Sem default — chamador (QuestPanel) sempre conhece
 * activeBase. Para retrocompat, callers antigos sem baseSlug recebem
 * `DEFAULT_BASE_SLUG` e ganham o fallback para state.studyDays via
 * `getCurrentForQuest`.
 */
export function getQuestProgress(state: GameState, baseSlug: string = DEFAULT_BASE_SLUG): QuestProgress[] {
  const today = todayISO();
  const weekStart = weekStartISO();
  const claimedAt = state.questsClaimedAt ?? {};

  return QUESTS.map(quest => {
    const claimed = isQuestClaimed(quest, claimedAt, today, weekStart);
    const current = getCurrentForQuest(quest, state, today, weekStart, baseSlug);
    const completed = current >= quest.target;
    return { quest, current, completed, claimed };
  });
}

export { QUESTS, todayISO, weekStartISO };
