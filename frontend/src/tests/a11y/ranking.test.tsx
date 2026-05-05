import '@testing-library/jest-dom/vitest';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { expectNoCriticalA11yViolations } from './axe-helper';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('@/lib/leaderboard-api', () => ({
  getPublicLeaderboard: vi.fn(),
  getMyRankAll: vi.fn(),
}));

import { RankingClient } from '@/app/ranking/RankingClient';
import { getPublicLeaderboard, getMyRankAll } from '@/lib/leaderboard-api';

describe('a11y · <RankingClient>', () => {
  beforeEach(() => {
    vi.mocked(getPublicLeaderboard).mockResolvedValue({
      entries: [
        { rank: 1, name: 'Alice', xpGained: 1200, avatarInitials: 'AL' },
        { rank: 2, name: 'Bob', xpGained: 900, avatarInitials: 'BO' },
        { rank: 3, name: 'Carol', xpGained: 700, avatarInitials: 'CA' },
        { rank: 4, name: 'Dan', xpGained: 500, avatarInitials: 'DA' },
      ],
      periodStart: '2026-04-01',
      periodEnd: '2026-04-30',
    });
    vi.mocked(getMyRankAll).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('não tem violações de a11y críticas com lista carregada', async () => {
    const { container, findAllByText } = render(<RankingClient />);
    // Espera o pódio carregar (mobile + desktop ambos renderizam "Alice")
    await findAllByText('Alice');
    await expectNoCriticalA11yViolations(container);
  });
});
