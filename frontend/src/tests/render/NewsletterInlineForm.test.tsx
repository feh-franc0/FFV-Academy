import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    xp: vi.fn(),
    badge: vi.fn(),
    streak: vi.fn(),
    levelUp: vi.fn(),
  },
}));

import { NewsletterInlineForm } from '@/components/NewsletterInlineForm';

describe('<NewsletterInlineForm> render', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(() => Promise.resolve(new Response()));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza input de email e botão de submit no estado idle', () => {
    render(<NewsletterInlineForm />);

    expect(screen.getByLabelText(/seu email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /assinar/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('exibe mensagem de erro para email inválido (sem @)', async () => {
    const user = userEvent.setup();
    render(<NewsletterInlineForm />);

    const input = screen.getByLabelText(/seu email/i);
    await user.type(input, 'emailsemarroba');

    // fireEvent.submit bypassa validação HTML5 do browser — testa nossa lógica client-side
    fireEvent.submit(input.closest('form')!);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/email inválido/i);
    expect(alert).toHaveAttribute('id', 'newsletter-error');
  });

  it('desabilita input e botão durante o estado loading', async () => {
    // fetch nunca resolve — mantém estado loading
    fetchMock.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<NewsletterInlineForm />);

    const input = screen.getByLabelText(/seu email/i);
    await user.type(input, 'user@example.com');
    await user.click(screen.getByRole('button', { name: /assinar/i }));

    expect(screen.getByLabelText(/seu email/i)).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('exibe estado de sucesso após fetch bem-sucedido', async () => {
    fetchMock.mockResolvedValue(new Response());

    const user = userEvent.setup();
    render(<NewsletterInlineForm />);

    await user.type(screen.getByLabelText(/seu email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /assinar/i }));

    await waitFor(() => {
      expect(screen.getByText(/inscrição feita/i)).toBeInTheDocument();
    });

    // O formulário não deve mais estar visível
    expect(screen.queryByRole('button', { name: /assinar/i })).not.toBeInTheDocument();
  });

  it('exibe estado de erro quando fetch lança exceção', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<NewsletterInlineForm />);

    await user.type(screen.getByLabelText(/seu email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /assinar/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/erro ao enviar/i);
  });
});
