import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// Mock useGameState pra controlar estados de teste.
const mockGameState = vi.hoisted(() => ({
  current: null as {
    xp: number;
    level: number;
    streak: number;
    completedModules: string[];
    quizScores: Record<string, { score: number; total: number; perfect: boolean }>;
    reviewCards: { dueDate: string }[];
    archivedCards: unknown[];
    studyDays: { date: string; xpEarned: number; modulesCompleted: number; minutes: number; cardsReviewed: number }[];
    perfectQuizStreak: number;
  } | null,
}));

vi.mock('@/hooks/useGameState', () => ({
  useGameState: () => ({
    state: mockGameState.current,
    levelInfo: mockGameState.current
      ? { level: 3, name: 'Praticante', xpMin: 0, xpMax: 1000, color: '#000', icon: '🏆' }
      : null,
    dueCards: [],
    todayReviewCount: 0,
    dailyGoalMet: false,
  }),
}));

import { LearningMirrorClient } from '@/app/meu-aprendizado/LearningMirrorClient';

describe('<LearningMirrorClient> — Espelho de Aprendizado', () => {
  afterEach(() => {
    cleanup();
    mockGameState.current = null;
  });

  it('renderiza estado vazio quando sem progresso', () => {
    mockGameState.current = null;
    render(<LearningMirrorClient />);
    expect(screen.getByText(/Sem espelho ainda/i)).toBeInTheDocument();
    // Microcopy de combate menciona ChatGPT/NotebookLM
    expect(screen.getByText(/ChatGPT e NotebookLM não fazem/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver bases disponíveis/i)).toBeInTheDocument();
  });

  it('renderiza hero personalizado quando tem progresso (módulos consolidados)', () => {
    mockGameState.current = {
      xp: 1200,
      level: 3,
      streak: 5,
      completedModules: ['m1', 'm2', 'm3', 'm4', 'm5'],
      quizScores: {},
      reviewCards: [],
      archivedCards: [],
      studyDays: [],
      perfectQuizStreak: 0,
    };
    render(<LearningMirrorClient />);
    expect(screen.getByText(/Você consolidou/i)).toBeInTheDocument();
    // "5 módulos" aparece no h1 + no shareable card — getAllByText
    expect(screen.getAllByText(/5 módulos/i).length).toBeGreaterThan(0);
  });

  it('mostra 4 KPIs principais com valores derivados do GameState', () => {
    mockGameState.current = {
      xp: 2500,
      level: 4,
      streak: 12,
      completedModules: ['m1', 'm2', 'm3'],
      quizScores: {},
      reviewCards: [],
      archivedCards: [{}, {}, {}, {}, {}, {}, {}], // 7 maduros
      studyDays: [
        // últimos 7 dias
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), xpEarned: 100, modulesCompleted: 1, minutes: 20, cardsReviewed: 5 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), xpEarned: 200, modulesCompleted: 1, minutes: 30, cardsReviewed: 8 },
      ],
      perfectQuizStreak: 2,
    };
    render(<LearningMirrorClient />);
    // 4 KPI cards — labels. "Memória de longo prazo" aparece também no shareable
    // card depois da Onda 1D (reposicionamento SM-2 → memória de longo prazo).
    expect(screen.getByText(/Esta semana/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Memória de longo prazo/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Streak atual/i)).toBeInTheDocument();
    expect(screen.getByText(/Pra revisar hoje/i)).toBeInTheDocument();
    // Valores: 2 módulos esta semana, 7 cards maduros, streak 12
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('identifica pontos cegos (quizzes <60%)', () => {
    mockGameState.current = {
      xp: 500,
      level: 2,
      streak: 3,
      completedModules: ['m1'],
      quizScores: {
        'algo-dificil': { score: 2, total: 10, perfect: false },  // 20%
        'algo-ok':      { score: 8, total: 10, perfect: false },  // 80% — não conta
        'outro-fraco':  { score: 3, total: 10, perfect: false },  // 30%
      },
      reviewCards: [],
      archivedCards: [],
      studyDays: [],
      perfectQuizStreak: 0,
    };
    render(<LearningMirrorClient />);
    expect(screen.getByText(/Pontos cegos identificados/i)).toBeInTheDocument();
    expect(screen.getByText(/2 conceitos que você ainda não cravou/i)).toBeInTheDocument();
    expect(screen.getByText(/algo dificil/i)).toBeInTheDocument();
    expect(screen.getByText(/outro fraco/i)).toBeInTheDocument();
    // O "algo ok" (80%) não aparece
    expect(screen.queryByText(/algo ok/i)).not.toBeInTheDocument();
  });

  it('shareable card menciona ChatGPT e NotebookLM (posicionamento)', () => {
    mockGameState.current = {
      xp: 1000,
      level: 3,
      streak: 7,
      completedModules: ['m1', 'm2'],
      quizScores: {},
      reviewCards: [],
      archivedCards: [],
      studyDays: [],
      perfectQuizStreak: 0,
    };
    render(<LearningMirrorClient />);
    // Posicionamento defensável — pode aparecer no hero E no shareable
    expect(screen.getAllByText(/ChatGPT esquece/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/NotebookLM/i).length).toBeGreaterThan(0);
  });
});
