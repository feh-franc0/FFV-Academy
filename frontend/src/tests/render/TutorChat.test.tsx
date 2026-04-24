import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mockamos o adapter tutor-api pra controlar stream (sem rede real)
vi.mock('@/lib/tutor-api', () => ({
  askTutor: vi.fn(async (_req: unknown, onDelta: (d: string) => void) => {
    onDelta('Resposta do tutor: ');
    onDelta('porque é assim.');
  }),
}));
vi.mock('@/lib/api-client', () => ({
  hasBackend: () => false,
}));

import { TutorChat } from '@/components/simulado/TutorChat';
import type { SimuladoQuestion } from '@/lib/simulados';

const question: SimuladoQuestion = {
  id: 'q1',
  stem: 'O que é EC2?',
  options: [
    { id: 'A', text: 'Servidor virtual' },
    { id: 'B', text: 'Banco de dados' },
  ],
  correctId: 'A',
  explanation: 'EC2 é compute.',
  topic: 'Compute',
  difficulty: 'easy',
};

describe('<TutorChat> render', () => {
  it('renderiza header e mensagem inicial do tutor', () => {
    render(<TutorChat question={question} onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /tutor ia/i })).toBeInTheDocument();
    expect(screen.getByText(/o que você gostaria de entender/i)).toBeInTheDocument();
    // 3 variantes de prompt
    expect(screen.getByRole('button', { name: /por que essa é a certa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analogia/i })).toBeInTheDocument();
  });

  it('pergunta ao tutor ao clicar em uma variante', async () => {
    const user = userEvent.setup();
    render(<TutorChat question={question} onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /por que essa é a certa/i }));
    // Mensagem do user e stream do tutor aparecem
    expect(await screen.findByText(/resposta correta é a correta/i)).toBeInTheDocument();
    expect(await screen.findByText(/resposta do tutor/i)).toBeInTheDocument();
  });

  it('fecha ao clicar no X', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TutorChat question={question} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '✕' }));
    expect(onClose).toHaveBeenCalled();
  });
});
