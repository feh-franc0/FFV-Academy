'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  loadState,
  completeModule,
  saveQuizScore,
  submitCardReview,
  isTrailUnlocked,
  getDueCards,
  recordArticleVisit,
  updateArticleProgress,
  completeOnboarding,
  setPreferredHub,
  type GameState,
  type CompleteModuleResult,
  type CompleteModuleInput,
  type ReviewCardResult,
  type LastArticle,
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

  const trackVisit = useCallback((meta: Omit<LastArticle, 'at' | 'progress'> & { progress?: number }) => {
    recordArticleVisit(meta);
    setState(loadState());
  }, []);

  const trackProgress = useCallback((slug: string, progress: number) => {
    updateArticleProgress(slug, progress);
    // Intentionally skip setState here — too noisy on scroll. Next focus refresh will pick it up.
  }, []);

  const finishOnboarding = useCallback((hub: string | null) => {
    completeOnboarding(hub);
    setState(loadState());
  }, []);

  const choosePreferredHub = useCallback((hub: string | null) => {
    setPreferredHub(hub);
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
    trackVisit,
    trackProgress,
    finishOnboarding,
    choosePreferredHub,
  };
}
