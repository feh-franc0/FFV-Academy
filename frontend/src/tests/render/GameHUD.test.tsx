import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// next/link e next/navigation precisam de mock pra rodar em jsdom
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// AuthBadge usa useAuth (requer provider) — mockamos o hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
    requireLogin: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  }),
}));

import { GameHUD } from '@/components/GameHUD';

describe('<GameHUD> render', () => {
  it('renderiza logo FFV Academy e navegação primária', () => {
    render(<GameHUD />);
    expect(screen.getByText('FFV')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
    // hubs primários aparecem como links
    const progressoLinks = screen.getAllByRole('link', { name: /progresso/i });
    expect(progressoLinks.length).toBeGreaterThan(0);
  });

  it('renderiza links dos 4 hubs principais', () => {
    render(<GameHUD />);
    expect(screen.getAllByRole('link').some(l => l.getAttribute('href') === '/ia')).toBe(true);
    expect(screen.getAllByRole('link').some(l => l.getAttribute('href') === '/aws')).toBe(true);
    expect(screen.getAllByRole('link').some(l => l.getAttribute('href') === '/engenharia')).toBe(true);
  });

  it('clique no logo não joga erro', async () => {
    const user = userEvent.setup();
    render(<GameHUD />);
    const logo = screen.getByText('Academy').closest('a')!;
    await user.click(logo);
  });
});
