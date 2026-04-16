'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  loadState,
  completeModule,
  saveQuizScore,
  submitCardReview,
  isTrailUnlocked,
  getDueCards,
  type GameState,
  type CompleteModuleResult,
  type CompleteModuleInput,
  type ReviewCardResult,
} from '@/lib/engine';
import type { ReviewQuality } from '@/lib/srs';
import { getLevelInfo, getTrailProgress, CURRICULUM } from '@/lib/curriculum';

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const refresh = useCallback(() => {
    setState(loadState());
  }, []);

  const markComplete = useCallback((input: CompleteModuleInput): CompleteModuleResult => {
    const result = completeModule(input);
    setState(loadState());
    return result;
  }, []);

  const submitQuiz = useCallback((slug: string, score: number, total: number) => {
    saveQuizScore(slug, score, total);
    setState(loadState());
  }, []);

  const reviewOne = useCallback((cardId: string, outcome: ReviewQuality): ReviewCardResult => {
    const result = submitCardReview(cardId, outcome);
    setState(loadState());
    return result;
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

  const dueCards = state ? getDueCards(state.reviewCards) : [];

  return {
    state,
    levelInfo,
    trailsProgress,
    overallPct,
    dueCards,
    markComplete,
    submitQuiz,
    reviewOne,
    refresh,
  };
}
