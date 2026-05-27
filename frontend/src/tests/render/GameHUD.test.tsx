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
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {}, back: () => {} }),
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

vi.mock('@/lib/sounds', () => ({
  unlockAudio: vi.fn(),
}));

// useGameState — sem state por default (anônimo). Override via mockReturnValue
// no teste específico quando precisar.
vi.mock('@/hooks/useGameState', () => ({
  useGameState: vi.fn(() => ({ state: null, levelInfo: null, dueCards: [] })),
}));

import { GameHUD } from '@/components/GameHUD';

/**
 * GameHUD foi drasticamente simplificado em 2026-05-26 (commit de header limpo).
 * O header agora tem apenas: Logo, BaseSwitcher, Busca, AuthBadge, ThemeToggle.
 * Tudo que era pill (XP, streak, conquistas, meta, cards) foi pro dropdown
 * do AuthBadge ou removido.
 *
 * Testes antigos cobriam navegação por hubs, streak pill, XP pill, etc. —
 * todos removidos do header. Os comportamentos preservados (Progresso, Revisar)
 * agora vivem dentro do dropdown do AuthBadge (que é testado em outro lugar).
 */
describe('<GameHUD>', () => {
  it('renderiza logo FFV Academy', () => {
    render(<GameHUD />);
    expect(screen.getByText('FFV')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
  });

  it('renderiza botão Entrar quando anônimo', () => {
    render(<GameHUD />);
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('clique no logo não joga erro', async () => {
    const user = userEvent.setup();
    render(<GameHUD />);
    const logo = screen.getByText('Academy').closest('a')!;
    await user.click(logo);
  });

  it('NÃO renderiza navegação por hub específico (foi pra home da base)', () => {
    render(<GameHUD />);
    // Hubs específicos (/ia, /aws, /engenharia) não aparecem mais no header.
    // Agora se navega via home da base.
    const links = screen.queryAllByRole('link');
    expect(links.some(l => l.getAttribute('href') === '/ia')).toBe(false);
    expect(links.some(l => l.getAttribute('href') === '/aws')).toBe(false);
    expect(links.some(l => l.getAttribute('href') === '/engenharia')).toBe(false);
  });

  it('renderiza tabs globais Simulados e Revisar', () => {
    render(<GameHUD />);
    const links = screen.getAllByRole('link');
    expect(links.some(l => l.getAttribute('href') === '/simulados')).toBe(true);
    expect(links.some(l => l.getAttribute('href') === '/revisar')).toBe(true);
  });

  it('NÃO renderiza chip de nível quando anônimo', () => {
    render(<GameHUD />);
    expect(screen.queryByText(/Nv\./)).not.toBeInTheDocument();
  });
});
