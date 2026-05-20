import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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

vi.mock('@/hooks/useGameState', () => ({
  useGameState: vi.fn(() => ({
    state: null,
    levelInfo: null,
    dueCards: [],
    todayReviewCount: 0,
    dailyGoalMet: false,
  })),
}));

vi.mock('@/lib/sounds', () => ({
  unlockAudio: vi.fn(),
}));

import { GameHUD } from '@/components/GameHUD';
import { useGameState } from '@/hooks/useGameState';
import { BaseNavProvider } from '@/components/base/BaseNavContext';
import { TECH_NAV_ITEMS } from '@/lib/bases/tecnologia/nav';

function renderGameHUD(opts: { hubNavItems?: typeof TECH_NAV_ITEMS; hideGlobalContentNav?: boolean } = {}) {
  return render(
    <BaseNavProvider
      value={{
        hubNavItems: opts.hubNavItems ?? TECH_NAV_ITEMS,
        hideGlobalContentNav: opts.hideGlobalContentNav,
      }}
    >
      <GameHUD />
    </BaseNavProvider>,
  );
}

describe('<GameHUD> render', () => {
  it('renderiza logo FFV Academy e navegação primária', () => {
    renderGameHUD();
    expect(screen.getByText('FFV')).toBeInTheDocument();
    expect(screen.getByText('Academy')).toBeInTheDocument();
    // hubs primários aparecem como links
    const progressoLinks = screen.getAllByRole('link', { name: /progresso/i });
    expect(progressoLinks.length).toBeGreaterThan(0);
  });

  it('renderiza links dos 4 hubs principais', () => {
    renderGameHUD();
    expect(screen.getAllByRole('link').some(l => l.getAttribute('href') === '/ia')).toBe(true);
    expect(screen.getAllByRole('link').some(l => l.getAttribute('href') === '/aws')).toBe(true);
    expect(screen.getAllByRole('link').some(l => l.getAttribute('href') === '/engenharia')).toBe(true);
  });

  it('clique no logo não joga erro', async () => {
    const user = userEvent.setup();
    renderGameHUD();
    const logo = screen.getByText('Academy').closest('a')!;
    await user.click(logo);
  });

  it('hideGlobalContentNav=true esconde link global /simulados', () => {
    renderGameHUD({ hubNavItems: [], hideGlobalContentNav: true });
    expect(
      screen.queryAllByRole('link').some(l => l.getAttribute('href') === '/simulados'),
    ).toBe(false);
  });

  it('hideGlobalContentNav=false (default) mostra link global /simulados', () => {
    renderGameHUD();
    expect(
      screen.getAllByRole('link').some(l => l.getAttribute('href') === '/simulados'),
    ).toBe(true);
  });

  it('Progresso aparece SEMPRE — independente da base ou flag', () => {
    renderGameHUD({ hubNavItems: [], hideGlobalContentNav: true });
    expect(
      screen.getAllByRole('link').some(l => l.getAttribute('href') === '/progresso'),
    ).toBe(true);
  });
});

describe('<GameHUD> com state preenchido', () => {
  beforeEach(() => {
    vi.mocked(useGameState).mockReturnValue({
      state: {
        xp: 750,
        level: 5,
        streak: 12,
        freezes: 1,
        dailyGoal: 3,
        badges: ['badge_first', 'badge_level5'],
        completedModules: [],
        quizScores: {},
        reviewCards: [],
        archivedCards: [],
        studyDays: [],
        totalStudyTime: 300,
        startedAt: '2024-01-01T00:00:00Z',
        lastStudyDate: '2024-01-10',
        lastReviewDate: null,
        lastArticle: null,
        preferredHub: null,
        onboardedAt: null,
        articleProgress: {},
        schemaVersion: 1,
      } as never,
      levelInfo: { level: 5, name: 'Aprendiz', icon: '⭐', color: '#58a6ff', xpMin: 400, xpMax: 700 },
      dueCards: [{ id: 'c1' }] as never,
      todayReviewCount: 1,
      dailyGoalMet: false,
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('mostra streak quando state.streak > 0', async () => {
    renderGameHUD();
    expect(await screen.findByText(/12d/)).toBeInTheDocument();
  });

  it('mostra pill de cards pendentes quando dueCards > 0', async () => {
    renderGameHUD();
    expect(await screen.findByLabelText(/1 cards? pendentes?/i)).toBeInTheDocument();
  });

  it('mostra pill de meta diária', async () => {
    // Counter agora vem de localStorage per-base (não do hook todayReviewCount).
    // Seedeamos manualmente o key da base default (tecnologia) pra simular 1 review hoje.
    const todayISO = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(`ffv_review_count:${todayISO}:tecnologia`, '1');
    renderGameHUD();
    expect(await screen.findByText(/🎯 1\/3/)).toBeInTheDocument();
  });

  it('mostra nível e XP', async () => {
    renderGameHUD();
    expect(await screen.findByText(/750 XP/)).toBeInTheDocument();
    expect(await screen.findByText(/Nv\.5/)).toBeInTheDocument();
  });
});
