import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Canvas .getContext é stub em jsdom; só precisamos que não quebre render.
// useGameState lê storage que já é limpo em beforeEach global (setup.ts).
import { Certificate } from '@/components/Certificate';

describe('<Certificate> render', () => {
  it('renderiza header com nome da trilha', () => {
    render(<Certificate trailId="trail1" onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /certificado de conclusão/i })).toBeInTheDocument();
    // Componente mostra "Trilha: <nome>" no subtítulo
    expect(screen.getByText(/trilha:/i)).toBeInTheDocument();
  });

  it('permite editar nome do holder e persistir', async () => {
    const user = userEvent.setup();
    render(<Certificate trailId="trail1" onClose={vi.fn()} />);
    const editButton = screen.getByRole('button', { name: /definir nome/i });
    await user.click(editButton);
    const input = screen.getByPlaceholderText(/seu nome/i);
    await user.type(input, 'Fernando');
    expect(input).toHaveValue('Fernando');
    await user.click(screen.getByRole('button', { name: /salvar/i }));
    // Após salvar, mostra o nome no botão editar
    expect(screen.getByRole('button', { name: /fernando/i })).toBeInTheDocument();
  });

  it('fecha ao clicar no X', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Certificate trailId="trail1" onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /fechar/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('retorna null quando trail não existe', () => {
    const { container } = render(<Certificate trailId="trail-inexistente" onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
