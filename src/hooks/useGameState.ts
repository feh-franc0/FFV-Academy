'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadState, completeModule, saveQuizScore, isTrailUnlocked, type GameState, type CompleteModuleResult } from '@/lib/engine';
import { getLevelInfo, getTrailProgress, CURRICULUM } from '@/lib/curriculum';

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const refresh = useCallback(() => {
    setState(loadState());
  }, []);

  const markComplete = useCallback((slug: string): CompleteModuleResult => {
    const result = completeModule(slug);
    setState(loadState());
    return result;
  }, []);

  const submitQuiz = useCallback((slug: string, score: number, total: number) => {
    saveQuizScore(slug, score, total);
    setState(loadState());
  }, []);

  const levelInfo = state ? getLevelInfo(state.xp) : null;

  const trailsProgress = CURRICULUM.map(trail => ({
    ...trail,
    ...getTrailProgress(trail.modules, state?.completedModules ?? []),
    unlocked: isTrailUnlocked(trail.id),
  }));

  const overallPct = state
    ? Math.round(
        (state.completedModules.length /
          CURRICULUM.reduce((acc, t) => acc + t.modules.length, 0)) *
          100
      )
    : 0;

  return {
    state,
    levelInfo,
    trailsProgress,
    overallPct,
    markComplete,
    submitQuiz,
    refresh,
  };
}
