import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginModal } from '@/components/auth/LoginModal';

describe('<LoginModal> render', () => {
  it('renderiza título e campos principais', () => {
    render(<LoginModal onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /entrar ou criar conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /receber código/i })).toBeInTheDocument();
  });

  it('mostra erro quando nome é muito curto', async () => {
    const user = userEvent.setup();
    render(<LoginModal onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Nome completo'), 'X');
    await user.type(screen.getByLabelText('Email'), 'teste@exemplo.com');
    await user.type(screen.getByLabelText(/celular/i), '11987654321');
    await user.click(screen.getByRole('checkbox'));
    // fireEvent.submit ignora validação HTML5 e dispara handleSubmitForm direto
    fireEvent.submit(screen.getByRole('button', { name: /receber código/i }).closest('form')!);

    expect(await screen.findByText(/nome muito curto/i)).toBeInTheDocument();
  });

  it('cancela ao clicar no botão cancelar', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<LoginModal onSuccess={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
