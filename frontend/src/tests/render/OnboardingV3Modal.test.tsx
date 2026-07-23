import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Hoisted state pra controlar GameState mock
const gameStateMock = vi.hoisted(() => ({
  current: {
    onboardedAt: null as string | null,
    completedModules: [] as string[],
    xp: 0,
    lastArticle: null,
  },
  finishOnboarding: vi.fn(),
}));

vi.mock('@/hooks/useGameState', () => ({
  useGameState: () => ({
    state: gameStateMock.current,
    finishOnboarding: gameStateMock.finishOnboarding,
  }),
}));

// Mock preferences API (offline-first: usa localStorage só)
vi.mock('@/lib/preferences-api', () => ({
  fetchPreferences: () => Promise.reject(new Error('not authenticated')),
  updatePreferences: () => Promise.reject(new Error('not authenticated')),
  serverToUserPreferences: (x: unknown) => x,
  userPreferencesToUpdateInput: (x: unknown) => x,
}));

import { OnboardingV3Modal } from '@/components/OnboardingV3Modal';

beforeEach(() => {
  window.localStorage.clear();
  gameStateMock.current = {
    onboardedAt: null,
    completedModules: [],
    xp: 0,
    lastArticle: null,
  };
  gameStateMock.finishOnboarding.mockClear();
});
afterEach(cleanup);

describe('<OnboardingV3Modal>', () => {
  it('NÃO abre se GameState já tem onboardedAt', async () => {
    gameStateMock.current.onboardedAt = '2026-05-01T00:00:00Z';
    render(<OnboardingV3Modal />);
    // dá tempo do setTimeout de 450ms
    await new Promise(r => setTimeout(r, 600));
    expect(screen.queryByTestId('onboarding-v3-modal')).not.toBeInTheDocument();
  });

  it('NÃO abre se usuário já tem atividade (completedModules > 0)', async () => {
    gameStateMock.current.completedModules = ['mod-1'];
    render(<OnboardingV3Modal />);
    await new Promise(r => setTimeout(r, 600));
    expect(screen.queryByTestId('onboarding-v3-modal')).not.toBeInTheDocument();
  });

  it('NÃO abre se URL tem ?skipOnboarding=1', async () => {
    // jsdom suporta history.replaceState
    window.history.replaceState({}, '', '/?skipOnboarding=1');
    render(<OnboardingV3Modal />);
    await new Promise(r => setTimeout(r, 600));
    expect(screen.queryByTestId('onboarding-v3-modal')).not.toBeInTheDocument();
    window.history.replaceState({}, '', '/');
  });

  it('abre depois de ~450ms quando user é novo', async () => {
    render(<OnboardingV3Modal />);
    await waitFor(
      () => expect(screen.getByTestId('onboarding-v3-modal')).toBeInTheDocument(),
      { timeout: 1000 },
    );
    // Tela intro mostra título principal
    expect(screen.getByText(/A plataforma se adapta a você/i)).toBeInTheDocument();
  });

  it('botão "Começar →" leva pro passo de bases', async () => {
    const user = userEvent.setup();
    render(<OnboardingV3Modal />);
    await waitFor(() => screen.getByTestId('onboarding-v3-modal'));
    await user.click(screen.getByRole('button', { name: /Começar →/ }));
    expect(screen.getByText(/Em qual área você quer estudar/i)).toBeInTheDocument();
    expect(screen.getByText(/PASSO 1 DE 4/i)).toBeInTheDocument();
  });

  it('botão "Continuar" desabilitado se nenhuma base selecionada', async () => {
    const user = userEvent.setup();
    render(<OnboardingV3Modal />);
    await waitFor(() => screen.getByTestId('onboarding-v3-modal'));
    await user.click(screen.getByRole('button', { name: /Começar →/ }));
    const next = screen.getByRole('button', { name: /Continuar →/ });
    expect(next).toBeDisabled();
  });

  it('clicar em base de interesse libera Continuar', async () => {
    const user = userEvent.setup();
    render(<OnboardingV3Modal />);
    await waitFor(() => screen.getByTestId('onboarding-v3-modal'));
    await user.click(screen.getByRole('button', { name: /Começar →/ }));
    // Clica na primeira base live
    await user.click(screen.getByRole('button', { name: /Tecnologia/i }));
    const next = screen.getByRole('button', { name: /Continuar →/ });
    expect(next).not.toBeDisabled();
    // Persiste no localStorage
    const stored = JSON.parse(window.localStorage.getItem('ffv_user_preferences_v1')!);
    expect(stored.interestedBases).toContain('tecnologia');
  });

  it('botão "Pular" chama finishOnboarding(null)', async () => {
    const user = userEvent.setup();
    render(<OnboardingV3Modal />);
    await waitFor(() => screen.getByTestId('onboarding-v3-modal'));
    await user.click(screen.getByRole('button', { name: /Pular/ }));
    expect(gameStateMock.finishOnboarding).toHaveBeenCalledWith(null);
  });

  it('ESC fecha o modal', async () => {
    const user = userEvent.setup();
    render(<OnboardingV3Modal />);
    await waitFor(() => screen.getByTestId('onboarding-v3-modal'));
    await user.keyboard('{Escape}');
    expect(gameStateMock.finishOnboarding).toHaveBeenCalledWith(null);
  });
});
