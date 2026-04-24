'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  loadState,
  completeModule,
  saveQuizScore,
  submitCardReview,
  isTrailUnlocked,
  getDueCards,
  getDailyChallenge,
  recordArticleVisit,
  updateArticleProgress,
  completeOnboarding,
  setPreferredHub,
  setDailyGoal,
  type GameState,
  type CompleteModuleResult,
  type CompleteModuleInput,
  type ReviewCardResult,
  type LastArticle,
  type DailyChallenge,
} from '@/lib/engine';
import type { ReviewQuality } from '@/lib/srs';
import { getLevelInfo, getTrailProgress, CURRICULUM } from '@/lib/curriculum';
import { GameStateStorage } from '@/lib/game-state-storage';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Problema do multi-tab:
 *
 * O localStorage é compartilhado entre todas as abas do mesmo origem.
 * Quando o usuário tem o site aberto em múltiplas abas e realiza uma ação
 * (ex: conclui um módulo), outras abas ficam com o estado desatualizado.
 *
 * Solução:
 * - O evento 'storage' é disparado pelo browser em todas as abas EXCETO a
 *   que fez a escrita. Ouvindo este evento, cada aba recarrega o estado
 *   do localStorage assim que outra aba o modifica.
 *
 * Debounce de 300ms nas escritas:
 * - Evita race condition quando duas abas tentam escrever simultaneamente.
 *   Ex: usuário clica em "concluir" nas duas abas ao mesmo tempo — sem
 *   debounce, a segunda escrita poderia sobrescrever a primeira antes que
 *   o evento 'storage' chegasse. Com 300ms de espera, o último write vence
 *   de forma determinística.
 *
 * Limitação conhecida: a aba que iniciou a escrita NÃO recebe o evento
 * 'storage' (comportamento spec do browser). Por isso chamamos setState
 * diretamente após cada mutação local — o evento cobre apenas as outras abas.
 */

/** Delay em ms para debounce de escritas no localStorage (evita race multi-tab). */
const WRITE_DEBOUNCE_MS = 300;

/**
 * Salva o GameState no IndexedDB de forma assíncrona.
 *
 * Por que separado do hook? É uma operação fire-and-forget que não precisa
 * de state React. A engine já atualiza o localStorage de forma síncrona
 * (compatibilidade imediata); o IndexedDB recebe a cópia assíncrona para
 * persistência durável sem bloquear a thread.
 *
 * @param state - Estado atual do jogo.
 */
export async function saveAsync(state: GameState): Promise<void> {
  await GameStateStorage.set(STORAGE_KEYS.GAME_STATE, state);
}

/**
 * Carrega o GameState do IndexedDB de forma assíncrona.
 *
 * Prioridade: IndexedDB → localStorage (via loadState).
 * Usado no startup para recuperar o estado persistido na sessão anterior.
 *
 * @returns Estado do jogo ou null se não houver dados persistidos.
 */
export async function loadAsync(): Promise<GameState | null> {
  return GameStateStorage.get<GameState>(STORAGE_KEYS.GAME_STATE);
}

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);

  // Referência ao timer de debounce — persiste entre renders sem causar re-render
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer de debounce separado para escritas assíncronas no IndexedDB.
  // Mantemos dois timers distintos porque a leitura (debouncedRefreshFromStorage)
  // e a escrita assíncrona têm ciclos de vida independentes.
  const idbDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Agenda a persistência do estado no IndexedDB com debounce de 300ms.
   *
   * Por que debounce? Mutações rápidas em sequência (ex: rolar a página dispara
   * trackProgress várias vezes) não devem resultar em N escritas no IndexedDB.
   * O debounce garante que apenas a última escrita de uma rajada é persitida.
   *
   * Fire-and-forget: erros são logados pelo GameStateStorage, não propagados.
   */
  const debouncedSaveToIDB = useCallback((currentState: GameState) => {
    if (idbDebounceTimerRef.current) {
      clearTimeout(idbDebounceTimerRef.current);
    }
    idbDebounceTimerRef.current = setTimeout(() => {
      saveAsync(currentState).catch(err =>
        console.error('[useGameState] Falha ao salvar no IndexedDB', err)
      );
      idbDebounceTimerRef.current = null;
    }, WRITE_DEBOUNCE_MS);
  }, []);

  /**
   * Agenda uma leitura do estado com debounce.
   * Usado pelo handler de storage para evitar múltiplas releituras em sequência
   * quando várias chaves são escritas quase simultaneamente (ex: engine escreve
   * GameState + badge no mesmo tick).
   */
  const debouncedRefreshFromStorage = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setState(loadState());
      debounceTimerRef.current = null;
    }, WRITE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    setState(loadState());

    /**
     * Handler do evento 'storage':
     * - Disparado pelo browser quando OUTRA aba escreve no localStorage.
     * - Filtra apenas a chave principal do jogo ('ffv_academy').
     * - Usa debounce para agrupar escritas em lote (ex: engine pode escrever
     *   múltiplas chaves em sequência rápida).
     */
    function handleStorageChange(e: StorageEvent) {
      if (e.key === 'ffv_academy' && e.newValue) {
        try {
          debouncedRefreshFromStorage();
        } catch {
          // Ignora erros de parse — loadState tem fallback para estado inicial
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      // Cancela debounces pendentes ao desmontar o componente
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (idbDebounceTimerRef.current) {
        clearTimeout(idbDebounceTimerRef.current);
      }
    };
  }, [debouncedRefreshFromStorage]);

  const refresh = useCallback(() => {
    setState(loadState());
  }, []);

  const markComplete = useCallback((input: CompleteModuleInput): CompleteModuleResult => {
    const result = completeModule(input);
    const next = loadState();
    setState(next);
    // Persiste no IndexedDB de forma assíncrona (não bloqueia a UI)
    if (next) debouncedSaveToIDB(next);
    return result;
  }, [debouncedSaveToIDB]);

  const submitQuiz = useCallback((slug: string, score: number, total: number) => {
    saveQuizScore(slug, score, total);
    const next = loadState();
    setState(next);
    if (next) debouncedSaveToIDB(next);
  }, [debouncedSaveToIDB]);

  const reviewOne = useCallback((cardId: string, outcome: ReviewQuality): ReviewCardResult => {
    const result = submitCardReview(cardId, outcome);
    const next = loadState();
    setState(next);
    if (next) debouncedSaveToIDB(next);
    return result;
  }, [debouncedSaveToIDB]);

  const trackVisit = useCallback((meta: Omit<LastArticle, 'at' | 'progress'> & { progress?: number }) => {
    recordArticleVisit(meta);
    const next = loadState();
    setState(next);
    if (next) debouncedSaveToIDB(next);
  }, [debouncedSaveToIDB]);

  const trackProgress = useCallback((slug: string, progress: number) => {
    updateArticleProgress(slug, progress);
    // Intentionally skip setState here — too noisy on scroll. Next focus refresh will pick it up.
    // IndexedDB: também não persiste aqui pelo mesmo motivo (scroll = muitos eventos).
  }, []);

  const finishOnboarding = useCallback((hub: string | null) => {
    completeOnboarding(hub);
    const next = loadState();
    setState(next);
    if (next) debouncedSaveToIDB(next);
  }, [debouncedSaveToIDB]);

  const choosePreferredHub = useCallback((hub: string | null) => {
    setPreferredHub(hub);
    const next = loadState();
    setState(next);
    if (next) debouncedSaveToIDB(next);
  }, [debouncedSaveToIDB]);

  const updateDailyGoal = useCallback((goal: number) => {
    setDailyGoal(goal);
    const next = loadState();
    setState(next);
    if (next) debouncedSaveToIDB(next);
  }, [debouncedSaveToIDB]);

  const levelInfo = state ? getLevelInfo(state.xp) : null;

  const trailsProgress = CURRICULUM.map(trail => ({
    ...trail,
    ...getTrailProgress(trail.modules, state?.completedModules ?? []),
    unlocked: isTrailUnlocked(),
  }));

  const overallPct = state
    ? Math.round(
        (state.completedModules.length /
          CURRICULUM.reduce((acc, t) => acc + t.modules.length, 0)) *
          100
      )
    : 0;

  const dueCards = state ? getDueCards(state.reviewCards) : [];
  const dailyChallenge = state ? getDailyChallenge() : null;

  return {
    state,
    levelInfo,
    trailsProgress,
    overallPct,
    dueCards,
    dailyChallenge,
    markComplete,
    submitQuiz,
    reviewOne,
    refresh,
    trackVisit,
    trackProgress,
    finishOnboarding,
    choosePreferredHub,
    updateDailyGoal,
  };
}
