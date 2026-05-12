import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mocks com vi.hoisted para evitar TDZ no hoisting do vi.mock
const mocks = vi.hoisted(() => ({
  finishOnboardingMock: vi.fn(),
  updateDailyGoalMock: vi.fn(),
  recordArticleVisitMock: vi.fn(),
}));

vi.mock('@/hooks/useGameState', () => ({
  useGameState: () => ({
    state: {
      onboardedAt: null,
      completedModules: [],
      xp: 0,
      lastArticle: null,
    },
    finishOnboarding: mocks.finishOnboardingMock,
    updateDailyGoal: mocks.updateDailyGoalMock,
  }),
}));

vi.mock('@/lib/engine', () => ({
  recordArticleVisit: mocks.recordArticleVisitMock,
}));

const { finishOnboardingMock, updateDailyGoalMock, recordArticleVisitMock } = mocks;

import { OnboardingModal } from '@/components/OnboardingModal';

describe('<OnboardingModal> v2 — 3-step diagnostic + playlist', () => {
  beforeEach(() => {
    finishOnboardingMock.mockReset();
    updateDailyGoalMock.mockReset();
    recordArticleVisitMock.mockReset();
  });

  async function openModal() {
    render(<OnboardingModal />);
    // O modal abre após setTimeout de 450ms — aguarda via waitFor
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    }, { timeout: 1500 });
  }

  it('completa o fluxo de 3 perguntas e mostra playlist personalizada', async () => {
    const user = userEvent.setup();
    await openModal();

    // Intro
    expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /vamos lá/i }));

    // Q1: nível — deve ser passo 1 de 3
    expect(screen.getByText(/diagnóstico · 1 de 3/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /iniciante/i }));
    await user.click(screen.getByRole('button', { name: /^continuar/i }));

    // Q2: foco
    expect(screen.getByText(/diagnóstico · 2 de 3/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /entender ia de verdade/i }));
    await user.click(screen.getByRole('button', { name: /^continuar/i }));

    // Q3: tempo (NOVO)
    expect(screen.getByText(/diagnóstico · 3 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/quanto tempo por dia/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /15 min\/dia/i }));
    await user.click(screen.getByRole('button', { name: /ver minha trilha/i }));

    // updateDailyGoal foi chamado com 3 (15 min/dia → 2-3 módulos)
    expect(updateDailyGoalMock).toHaveBeenCalledWith(3);

    // Playlist — passo "choose"
    expect(screen.getByRole('heading', { name: /sua trilha personalizada/i })).toBeInTheDocument();
  });

  it('navega back e forward entre os passos', async () => {
    const user = userEvent.setup();
    await openModal();

    await user.click(screen.getByRole('button', { name: /vamos lá/i }));
    await user.click(screen.getByRole('button', { name: /iniciante/i }));
    await user.click(screen.getByRole('button', { name: /^continuar/i }));
    expect(screen.getByText(/diagnóstico · 2 de 3/i)).toBeInTheDocument();

    // Voltar pra Q1
    await user.click(screen.getByRole('button', { name: /← voltar/i }));
    expect(screen.getByText(/diagnóstico · 1 de 3/i)).toBeInTheDocument();

    // Forward de novo
    await user.click(screen.getByRole('button', { name: /^continuar/i }));
    expect(screen.getByText(/diagnóstico · 2 de 3/i)).toBeInTheDocument();

    // Forward para Q3
    await user.click(screen.getByRole('button', { name: /dominar a aws/i }));
    await user.click(screen.getByRole('button', { name: /^continuar/i }));
    expect(screen.getByText(/diagnóstico · 3 de 3/i)).toBeInTheDocument();

    // Voltar pra Q2
    await user.click(screen.getByRole('button', { name: /← voltar/i }));
    expect(screen.getByText(/diagnóstico · 2 de 3/i)).toBeInTheDocument();
  });

  it('skip salva onboardedAt sem hub', async () => {
    const user = userEvent.setup();
    await openModal();

    await user.click(screen.getByRole('button', { name: /pular/i }));

    expect(finishOnboardingMock).toHaveBeenCalledWith(null);
  });
});
