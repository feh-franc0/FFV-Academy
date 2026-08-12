import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('@/components/simulado/CertificateModal', () => ({
  CertificateModal: () => <div data-testid="certificate-modal" />,
}));

const mockListAttemptsApi = vi.fn();
const mockClaimXPCredit = vi.fn().mockResolvedValue({ claimed: true });
vi.mock('@/lib/simulados-api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/simulados-api')>('@/lib/simulados-api');
  return {
    ...actual,
    listAttemptsApi: () => mockListAttemptsApi(),
    claimXPCredit: (attemptId: string) => mockClaimXPCredit(attemptId),
  };
});

const mockFetchQuestionsByIds = vi.fn().mockResolvedValue([]);
vi.mock('@/lib/clf-bank', async () => {
  const actual = await vi.importActual<typeof import('@/lib/clf-bank')>('@/lib/clf-bank');
  return { ...actual, fetchQuestionsByIds: (...args: unknown[]) => mockFetchQuestionsByIds(...args) };
});

import { ResultadoClient } from '@/components/simulado/ResultadoClient';
import { stashResult } from '@/lib/simulado-result-bridge';
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth';
import type { UserProfile } from '@/lib/auth';

const SLUG = 'aws-practitioner';
const SIMULADO_ID = 'simulado-aws-practitioner';

const FAKE_USER: UserProfile = {
  id: 'user_001',
  email: 'tester@exemplo.com',
  name: 'Tester',
  phone: '+5511987654321',
  createdAt: new Date().toISOString(),
  marketingConsent: true,
  role: 'user',
  paidProducts: [],
};

function renderWithAuth(user: UserProfile | null = FAKE_USER) {
  const ctx: AuthContextValue = {
    user,
    isLoggedIn: !!user,
    carregando: false,
    requireLogin: vi.fn().mockResolvedValue(FAKE_USER),
    refresh: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={ctx}>
      <ResultadoClient slug={SLUG} />
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  mockListAttemptsApi.mockReset().mockResolvedValue([]);
  mockFetchQuestionsByIds.mockClear();
  mockClaimXPCredit.mockReset().mockResolvedValue({ claimed: true });
});

describe('<ResultadoClient> — resultado vem do servidor, nunca recalculado no cliente', () => {
  it('lê o resultado da ponte (sessionStorage) e exibe score/aprovação/tópicos fracos', async () => {
    stashResult(SIMULADO_ID, {
      attemptId: 'att_001',
      simuladoId: SIMULADO_ID,
      score: { value: 85, correct: 17, total: 20, passed: true, byTopic: { IAM: { correct: 4, total: 5 } } },
      weakTopics: ['IAM'],
      questionIds: [],
      answers: {},
      finishedAt: new Date().toISOString(),
    });

    renderWithAuth();

    expect(await screen.findByTestId('score-value')).toHaveTextContent('85%');
    expect(screen.getByText(/você passaria/i)).toBeInTheDocument();
    expect(screen.getAllByText(/IAM/).length).toBeGreaterThan(0);
  });

  it('consome a ponte uma única vez — reload subsequente não reexibe o mesmo resultado', async () => {
    stashResult(SIMULADO_ID, {
      attemptId: 'att_002',
      simuladoId: SIMULADO_ID,
      score: { value: 60, correct: 12, total: 20, passed: false, byTopic: {} },
      weakTopics: [],
      questionIds: [],
      answers: {},
      finishedAt: new Date().toISOString(),
    });

    const { unmount } = renderWithAuth();
    expect(await screen.findByTestId('score-value')).toHaveTextContent('60%');
    unmount();

    mockListAttemptsApi.mockResolvedValue([]);
    renderWithAuth();
    expect(await screen.findByText(/nenhum resultado encontrado/i)).toBeInTheDocument();
  });

  it('sem ponte, cai no fallback via listAttemptsApi (reload/link direto)', async () => {
    mockListAttemptsApi.mockResolvedValue([
      {
        id: 'att_003',
        simuladoId: 'aws-clf', // dbBankId do catálogo, não o id do catálogo
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        answers: { q1: 'A' },
        score: 90,
        passed: true,
      },
    ]);

    renderWithAuth();
    expect(await screen.findByTestId('score-value')).toHaveTextContent('90%');
  });

  it('sem ponte e sem tentativa finalizada, mostra "nenhum resultado encontrado"', async () => {
    mockListAttemptsApi.mockResolvedValue([]);
    renderWithAuth();
    expect(await screen.findByText(/nenhum resultado encontrado/i)).toBeInTheDocument();
  });

  it('botão de emitir certificado fica desabilitado abaixo da nota mínima', async () => {
    stashResult(SIMULADO_ID, {
      attemptId: 'att_004',
      simuladoId: SIMULADO_ID,
      score: { value: 40, correct: 8, total: 20, passed: false, byTopic: {} },
      weakTopics: [],
      questionIds: [],
      answers: {},
      finishedAt: new Date().toISOString(),
    });

    renderWithAuth();
    const btn = await screen.findByRole('button', { name: /atinja \d+% para emitir/i });
    expect(btn).toBeDisabled();
  });

  it('busca as questões da revisão pelos questionIds da ponte, não do catálogo local', async () => {
    stashResult(SIMULADO_ID, {
      attemptId: 'att_005',
      simuladoId: SIMULADO_ID,
      score: { value: 100, correct: 2, total: 2, passed: true, byTopic: {} },
      weakTopics: [],
      questionIds: ['q1', 'q2'],
      answers: { q1: 'A', q2: 'B' },
      finishedAt: new Date().toISOString(),
    });

    renderWithAuth();
    await waitFor(() => expect(mockFetchQuestionsByIds).toHaveBeenCalledWith(['q1', 'q2'], 'aws-clf'));
  });

  it('mostra falha com retry quando o fetch da revisão falha — o resultado principal continua visível', async () => {
    mockFetchQuestionsByIds.mockReset().mockRejectedValueOnce(new Error('network down'));
    stashResult(SIMULADO_ID, {
      attemptId: 'att_006',
      simuladoId: SIMULADO_ID,
      score: { value: 80, correct: 8, total: 10, passed: true, byTopic: {} },
      weakTopics: [],
      questionIds: ['q1'],
      answers: { q1: 'A' },
      finishedAt: new Date().toISOString(),
    });

    renderWithAuth();

    expect(await screen.findByTestId('score-value')).toHaveTextContent('80%');
    expect(await screen.findByText(/não conseguimos carregar a revisão/i)).toBeInTheDocument();

    mockFetchQuestionsByIds.mockResolvedValueOnce([]);
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
    await waitFor(() => expect(mockFetchQuestionsByIds).toHaveBeenCalledTimes(2));
    expect(screen.queryByText(/não conseguimos carregar a revisão/i)).not.toBeInTheDocument();
  });

  it('reivindica o crédito de XP no servidor (não sessionStorage) e concede XP quando claimed=true', async () => {
    mockClaimXPCredit.mockResolvedValue({ claimed: true });
    stashResult(SIMULADO_ID, {
      attemptId: 'att_007',
      simuladoId: SIMULADO_ID,
      score: { value: 90, correct: 9, total: 10, passed: true, byTopic: {} },
      weakTopics: [],
      questionIds: [],
      answers: {},
      finishedAt: new Date().toISOString(),
    });

    renderWithAuth();

    await waitFor(() => expect(mockClaimXPCredit).toHaveBeenCalledWith('att_007'));
    expect(await screen.findByText(/XP creditados/i)).toBeInTheDocument();
  });

  it('não concede XP quando o servidor diz que já foi reivindicado (claimed=false) — a prova de idempotência', async () => {
    mockClaimXPCredit.mockResolvedValue({ claimed: false });
    stashResult(SIMULADO_ID, {
      attemptId: 'att_008',
      simuladoId: SIMULADO_ID,
      score: { value: 90, correct: 9, total: 10, passed: true, byTopic: {} },
      weakTopics: [],
      questionIds: [],
      answers: {},
      finishedAt: new Date().toISOString(),
    });

    renderWithAuth();

    await waitFor(() => expect(mockClaimXPCredit).toHaveBeenCalledWith('att_008'));
    expect(await screen.findByTestId('score-value')).toHaveTextContent('90%');
    expect(screen.queryByText(/XP creditados/i)).not.toBeInTheDocument();
  });
});
