import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginModal } from '@/components/auth/LoginModal';

describe('<LoginModal> render', () => {
  it('renderiza título e campo de email no passo inicial', () => {
    render(<LoginModal onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /bem-vindo de volta/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/voce@email\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
    // Nome e celular não aparecem no passo inicial
    expect(screen.queryByLabelText('Nome completo')).not.toBeInTheDocument();
  });

  it('mostra erro para email vazio ao submeter', async () => {
    render(<LoginModal onSuccess={vi.fn()} onCancel={vi.fn()} />);

    // fireEvent.submit bypassa validação HTML5 do input[type=email]
    fireEvent.submit(screen.getByRole('button', { name: /continuar/i }).closest('form')!);

    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument();
  });

  it('cancela ao clicar no botão cancelar', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<LoginModal onSuccess={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
