import '@testing-library/jest-dom/vitest';
import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoCriticalA11yViolations } from './axe-helper';

// next/link → <a> simples (evita runtime do Next em jsdom)
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// useGameState — sem progresso (caminho inicial do hero)
vi.mock('@/hooks/useGameState', () => ({
  useGameState: () => ({ state: null }),
}));

// useAuth — usuário deslogado
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isLoggedIn: false }),
}));

// API de leaderboard mockada para o widget HomeRanking
vi.mock('@/lib/leaderboard-api', () => ({
  getLeaderboard: vi.fn().mockResolvedValue({ weekStart: '2026-04-20', items: [] }),
  getMyRank: vi.fn().mockResolvedValue(null),
  getPublicLeaderboard: vi.fn().mockResolvedValue({ entries: [] }),
  getMyRankAll: vi.fn().mockResolvedValue([]),
}));

import { HomeClient } from '@/components/HomeClient';

describe('a11y · <HomeClient>', () => {
  it('não tem violações de a11y críticas no estado inicial', async () => {
    const { container } = render(<HomeClient />);
    await expectNoCriticalA11yViolations(container);
  });
});
