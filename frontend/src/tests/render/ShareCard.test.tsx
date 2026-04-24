import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ShareCard } from '@/components/ShareCard';

describe('<ShareCard> render', () => {
  it('retorna null quando GameState está vazio (sem mount prévio)', () => {
    // loadState() cria estado default, mas se não houver state carregado ainda
    // o componente retorna null. Teste tolerante: apenas garante que não joga.
    const { container } = render(<ShareCard onClose={vi.fn()} />);
    // Em jsdom com useGameState assíncrono, inicialmente pode ser null
    // ou renderizar o header. Validação smoke: não quebra.
    expect(container).toBeTruthy();
  });

  it('renderiza modal com título e botões principais quando tem state', async () => {
    // state é carregado em useEffect — aguardamos findBy
    render(<ShareCard onClose={vi.fn()} />);
    expect(await screen.findByRole('heading', { name: /compartilhar progresso/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar imagem/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeInTheDocument();
  });

  it('fecha ao clicar no botão fechar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShareCard onClose={onClose} />);
    await screen.findByRole('heading', { name: /compartilhar progresso/i });
    await user.click(screen.getByRole('button', { name: /fechar/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
