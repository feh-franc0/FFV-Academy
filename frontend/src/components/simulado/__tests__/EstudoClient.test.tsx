import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SimuladoQuestion } from '@/lib/simulados';

const { richQuestion } = vi.hoisted(() => {
  const q: SimuladoQuestion = {
    id: 'mock-q1',
    stem: 'Qual serviço AWS é object storage com 11 noves de durabilidade?',
    options: [
      { id: 'A', text: 'EBS' },
      { id: 'B', text: 'S3' },
      { id: 'C', text: 'EFS' },
      { id: 'D', text: 'FSx' },
    ],
    correctId: 'B',
    explanation: {
      summary: 'S3 é object storage com durabilidade 11x9.',
      whyCorrect: 'S3 replica em múltiplas AZs por padrão.',
      whyWrong: {
        A: 'EBS é block storage de uma única AZ.',
        C: 'EFS é file system NFS, não object.',
        D: 'FSx é file system gerenciado.',
      },
      keyConcept: 'Object vs Block vs File',
      compareWith: ['Glacier', 'EBS Snapshots'],
      commonMistakes: ['Confundir 11 noves de durabilidade com 11 noves de disponibilidade.'],
      tutorSeeds: ['Diferença entre durabilidade e disponibilidade?'],
    } as unknown as string,
    topic: 'Cloud Technology & Services',
    difficulty: 'easy',
  };
  return { richQuestion: q };
});

vi.mock('@/lib/clf-bank', () => ({
  fetchOneRandomQuestion: vi.fn().mockResolvedValue(richQuestion),
  fetchRandomQuestions: vi.fn().mockResolvedValue([richQuestion]),
  fetchQuestionsByIds: vi.fn().mockResolvedValue([richQuestion]),
  CLF_SIMULADO_ID: 'aws-clf',
  CLF_DOMAIN_WEIGHTS: {
    'Cloud Concepts': 24,
    'Security & Compliance': 30,
    'Cloud Technology & Services': 34,
    'Billing, Pricing & Support': 12,
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: true,
    requireLogin: vi.fn().mockResolvedValue(undefined),
    user: { id: 'u1', email: 'u@example.com' },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { EstudoClient } from '../EstudoClient';

describe('EstudoClient', () => {
  it('carrega questão da API e renderiza stem + opções', async () => {
    render(<EstudoClient />);
    await waitFor(() => expect(screen.getByText(/object storage com 11 noves/i)).toBeInTheDocument());
    expect(screen.getByText('EBS')).toBeInTheDocument();
    expect(screen.getByText('S3')).toBeInTheDocument();
    expect(screen.getByText(/Cloud Technology/)).toBeInTheDocument();
  });

  it('confirmar resposta revela explicação rica (whyCorrect + whyWrong por distractor)', async () => {
    const user = userEvent.setup();
    render(<EstudoClient />);
    await waitFor(() => expect(screen.getByText(/object storage com 11 noves/i)).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: /S3/ }));
    await user.click(screen.getByRole('button', { name: /Confirmar resposta/i }));

    expect(screen.getByText(/Acertou!/i)).toBeInTheDocument();
    expect(screen.getByText(/replica em múltiplas AZs/i)).toBeInTheDocument();
    expect(screen.getByText(/EBS é block storage/i)).toBeInTheDocument();
    expect(screen.getByText(/EFS é file system NFS/i)).toBeInTheDocument();
    expect(screen.getByText(/Object vs Block vs File/)).toBeInTheDocument();
    expect(screen.getByText(/Confundir 11 noves/i)).toBeInTheDocument();
  });

  it('mostra "A correta era X" quando o user erra', async () => {
    const user = userEvent.setup();
    render(<EstudoClient />);
    await waitFor(() => expect(screen.getByText(/object storage com 11 noves/i)).toBeInTheDocument());

    await user.click(screen.getByRole('radio', { name: /EBS/ }));
    await user.click(screen.getByRole('button', { name: /Confirmar resposta/i }));

    expect(screen.getByText(/A correta era B/i)).toBeInTheDocument();
  });
});
