'use client';

import type { GameState } from './engine';

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

export { todayISO, weekStartISO };
