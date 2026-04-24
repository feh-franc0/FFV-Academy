import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsCard } from '@/components/news/NewsCard';
import type { NewsItem } from '@/lib/news';

const item: NewsItem = {
  id: 'teste-noticia-1',
  title: 'Anthropic lança Claude 4.7 com contexto 1M',
  summary: 'Modelo novo com contexto maior e mais barato — disponível via API.',
  source: 'Anthropic',
  sourceUrl: 'https://www.anthropic.com/news/claude-4-7',
  publishedAt: '2026-04-20',
  category: 'launch',
  hot: true,
};

describe('<NewsCard> render', () => {
  it('renderiza título, fonte e resumo', () => {
    render(<NewsCard item={item} />);
    expect(screen.getByRole('heading', { name: /claude 4\.7/i })).toBeInTheDocument();
    expect(screen.getByText(/contexto maior/i)).toBeInTheDocument();
  });

  it('aponta para a URL externa com target=_blank', () => {
    render(<NewsCard item={item} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://www.anthropic.com/news/claude-4-7');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toMatch(/noopener/);
  });

  it('interação de clique não lança erro', async () => {
    const user = userEvent.setup();
    render(<NewsCard item={item} />);
    await user.click(screen.getByRole('link'));
  });
});
