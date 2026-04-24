import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsClient } from '@/components/news/NewsClient';
import type { NewsItem } from '@/lib/news';

const items: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Primeira notícia de teste',
    summary: 'Resumo suficientemente longo para passar na validação do schema zod.',
    source: 'Anthropic',
    sourceUrl: 'https://www.anthropic.com/a',
    publishedAt: '2026-04-20',
    category: 'launch',
    hot: true,
  },
  {
    id: 'news-2',
    title: 'Segunda notícia também extensa o suficiente',
    summary: 'Outro resumo que passa na validação do schema zod sem problema.',
    source: 'OpenAI',
    sourceUrl: 'https://openai.com/b',
    publishedAt: '2026-04-15',
    category: 'research',
  },
];

describe('<NewsClient> render', () => {
  it('renderiza lista vazia com mensagem quando filtro não casa', async () => {
    const user = userEvent.setup();
    render(<NewsClient items={items} />);
    // Começa mostrando items; aplicamos filtro de categoria que não tem nenhum item
    await user.click(screen.getByRole('button', { name: /regulação/i }));
    expect(screen.getByText(/nenhuma notícia/i)).toBeInTheDocument();
  });

  it('renderiza items e seção de destaques para hot', () => {
    render(<NewsClient items={items} />);
    expect(screen.getByText(/primeira notícia de teste/i)).toBeInTheDocument();
    expect(screen.getByText(/segunda notícia/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /destaques/i })).toBeInTheDocument();
  });

  it('permite filtrar por fonte via chip', async () => {
    const user = userEvent.setup();
    render(<NewsClient items={items} />);
    // Clica no chip da fonte "OpenAI" — o item "Anthropic" some.
    const openaiChips = screen.getAllByRole('button', { name: /openai/i });
    await user.click(openaiChips[0]);
    expect(screen.queryByText(/primeira notícia de teste/i)).not.toBeInTheDocument();
    expect(screen.getByText(/segunda notícia/i)).toBeInTheDocument();
  });
});
