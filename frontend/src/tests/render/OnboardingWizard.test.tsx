import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { updatePreferencesMock } = vi.hoisted(() => ({
  updatePreferencesMock: vi.fn(),
}));

vi.mock('@/lib/preferences-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/preferences-api')>();
  return {
    ...actual,
    updatePreferences: updatePreferencesMock,
  };
});

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

function defaultPrefsResponse(over: Record<string, unknown> = {}) {
  return {
    hubIds: ['hub-ia'],
    trailIds: [],
    certificationIds: [],
    objectives: ['certifications'],
    skillLevel: 'intermediate',
    dailyQuestionEnabled: true,
    onboarded: true,
    onboardedAt: '2026-05-16T12:00:00Z',
    updatedAt: '2026-05-16T12:00:00Z',
    ...over,
  };
}

describe('OnboardingWizard', () => {
  beforeEach(() => {
    updatePreferencesMock.mockReset();
  });

  it('renderiza step 1 com stepper 1/3', () => {
    render(<OnboardingWizard onComplete={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: /Bem-vindo|Qual seu objetivo/i })).toBeInTheDocument();
    expect(screen.getByText(/Qual seu objetivo principal/i)).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo · 1\/3/i)).toBeInTheDocument();
  });

  it('botão Próximo desabilitado até selecionar ao menos 1 opção no step 1', async () => {
    render(<OnboardingWizard onComplete={vi.fn()} />);
    const next = screen.getByRole('button', { name: /Próximo/i });
    expect(next).toBeDisabled();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Passar em certificações/i }));
    expect(next).toBeEnabled();
  });

  it('avança de step 1 → 2 ao clicar em Próximo', async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Passar em certificações/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));

    expect(screen.getByText(/O que você quer estudar/i)).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo · 2\/3/i)).toBeInTheDocument();
  });

  it('botão Voltar funciona após avançar', async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Passar em certificações/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    await user.click(screen.getByRole('button', { name: /Voltar/i }));

    expect(screen.getByText(/Qual seu objetivo principal/i)).toBeInTheDocument();
  });

  it('step 3 mostra botão Finalizar (não Próximo)', async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={vi.fn()} />);

    // Step 1: marca um objetivo
    await user.click(screen.getByRole('button', { name: /Passar em certificações/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));

    // Step 2: marca um hub
    await user.click(screen.getByRole('button', { name: /Inteligência Artificial/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));

    expect(screen.getByText(/Conte um pouco sobre você/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Finalizar e começar/i })).toBeInTheDocument();
  });

  it('submit dispara PUT com payload completo e chama onComplete', async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    updatePreferencesMock.mockResolvedValue(defaultPrefsResponse());

    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={onComplete} />);

    // Step 1
    await user.click(screen.getByRole('button', { name: /Passar em certificações/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));

    // Step 2
    await user.click(screen.getByRole('button', { name: /Inteligência Artificial/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));

    // Step 3 — escolhe nível
    await user.click(screen.getByRole('button', { name: /^Intermediário/i }));
    await user.click(screen.getByRole('button', { name: /Finalizar e começar/i }));

    await waitFor(() => expect(updatePreferencesMock).toHaveBeenCalledTimes(1));
    const payload = updatePreferencesMock.mock.calls[0][0];
    expect(payload).toMatchObject({
      objectives: ['certifications'],
      hubIds: ['ia'],
      skillLevel: 'intermediate',
    });

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it('mostra erro inline quando update falha + libera retry', async () => {
    updatePreferencesMock.mockImplementationOnce(() => Promise.reject(new Error('500 internal')));

    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Passar em certificações/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    await user.click(screen.getByRole('button', { name: /Inteligência Artificial/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    await user.click(screen.getByRole('button', { name: /^Iniciante/i }));
    await user.click(screen.getByRole('button', { name: /Finalizar e começar/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/500 internal/i)
    );

    // Botão Finalizar deve estar habilitado novamente pra retry
    expect(screen.getByRole('button', { name: /Finalizar e começar/i })).toBeEnabled();
  });

  it('certificações são opcionais no step 3 (submeta sem marcar nenhuma)', async () => {
    updatePreferencesMock.mockResolvedValue(defaultPrefsResponse({ certificationIds: [] }));
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(<OnboardingWizard onComplete={onComplete} />);

    await user.click(screen.getByRole('button', { name: /Passar em certificações/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    await user.click(screen.getByRole('button', { name: /Inteligência Artificial/i }));
    await user.click(screen.getByRole('button', { name: /Próximo/i }));
    await user.click(screen.getByRole('button', { name: /^Avançado/i }));
    await user.click(screen.getByRole('button', { name: /Finalizar e começar/i }));

    await waitFor(() => expect(updatePreferencesMock).toHaveBeenCalledTimes(1));
    const payload = updatePreferencesMock.mock.calls[0][0];
    expect(payload.certificationIds).toEqual([]);
  });
});
