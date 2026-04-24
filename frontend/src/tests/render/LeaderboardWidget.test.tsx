import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mockamos leaderboard-api pra controlar o retorno (nada de rede real).
// E useAuth pra não depender de provider no teste.
vi.mock('@/lib/leaderboard-api', () => ({
  getLeaderboard: vi.fn(),
  getMyRank: vi.fn(),
}));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isLoggedIn: false }),
}));

import { LeaderboardWidget } from '@/components/LeaderboardWidget';
import { getLeaderboard, getMyRank } from '@/lib/leaderboard-api';

describe('<LeaderboardWidget> render', () => {
  it('renderiza 3 items quando API retorna lista', async () => {
    vi.mocked(getLeaderboard).mockResolvedValue({
      weekStart: '2026-04-20',
      items: [
        { rank: 1, userId: 'u1', name: 'Alice', xpGained: 500, avatarInitials: 'AL' },
        { rank: 2, userId: 'u2', name: 'Bob', xpGained: 300, avatarInitials: 'BO' },
        { rank: 3, userId: 'u3', name: 'Carol', xpGained: 100, avatarInitials: 'CA' },
      ],
    });
    vi.mocked(getMyRank).mockResolvedValue(null);

    render(<LeaderboardWidget />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ranking semanal/i })).toBeInTheDocument();
  });

  it('renderiza com lista vazia (items: [])', async () => {
    vi.mocked(getLeaderboard).mockResolvedValue({
      weekStart: '2026-04-20',
      items: [],
    });
    vi.mocked(getMyRank).mockResolvedValue(null);

    render(<LeaderboardWidget />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ranking semanal/i })).toBeInTheDocument();
    });
  });

  it('não renderiza nada quando API retorna null (backend offline)', async () => {
    vi.mocked(getLeaderboard).mockResolvedValue(null);
    vi.mocked(getMyRank).mockResolvedValue(null);

    const { container } = render(<LeaderboardWidget />);
    // Primeiro mostra skeleton, depois some (null data)
    await waitFor(() => {
      expect(container.querySelector('.animate-pulse')).toBeNull();
    });
    expect(container.firstChild).toBeNull();
  });
});
