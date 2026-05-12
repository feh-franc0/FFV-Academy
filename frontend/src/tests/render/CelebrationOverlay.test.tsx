import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { CelebrationOverlay } from '@/components/CelebrationOverlay';

vi.mock('@/lib/curriculum', () => ({
  BADGES_DEF: [
    { id: 'badge_first', name: 'Primeiro Módulo', icon: '🌱', desc: 'Completou o primeiro módulo', xpBonus: 50 },
    { id: 'badge_level5', name: 'Aprendiz', icon: '⭐', desc: 'Alcançou nível 5', xpBonus: 100 },
  ],
  LEVELS: [
    { level: 1, name: 'Curioso', icon: '🌱', color: '#3fb950', xpMin: 0, xpMax: 100 },
    { level: 5, name: 'Aprendiz', icon: '⭐', color: '#58a6ff', xpMin: 400, xpMax: 700 },
  ],
}));

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.clearAllMocks();
});

describe('<CelebrationOverlay>', () => {
  it('renderiza evento de badge corretamente', () => {
    const onDismiss = vi.fn();
    render(
      <CelebrationOverlay
        events={[{ kind: 'badge', badgeId: 'badge_first' }]}
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/BADGE DESBLOQUEADA/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Primeiro Módulo/i).length).toBeGreaterThan(0);
  });

  it('renderiza evento de level up', () => {
    const onDismiss = vi.fn();
    render(
      <CelebrationOverlay
        events={[{ kind: 'level', level: 5 }]}
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByText(/LEVEL UP/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Aprendiz/i).length).toBeGreaterThan(0);
  });

  it('renderiza evento de streak', () => {
    render(
      <CelebrationOverlay
        events={[{ kind: 'streak', days: 7 }]}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText(/STREAK/i)).toBeInTheDocument();
    expect(screen.getByText(/7 dias seguidos/i)).toBeInTheDocument();
  });

  it('chama onDismiss ao clicar no overlay', () => {
    const onDismiss = vi.fn();
    render(
      <CelebrationOverlay
        events={[{ kind: 'streak', days: 3 }]}
        onDismiss={onDismiss}
      />
    );
    act(() => { fireEvent.click(screen.getByRole('dialog')); });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('avança para o próximo evento ao clicar quando há múltiplos', () => {
    const onDismiss = vi.fn();
    render(
      <CelebrationOverlay
        events={[
          { kind: 'streak', days: 3 },
          { kind: 'badge', badgeId: 'badge_first' },
        ]}
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByText(/STREAK/i)).toBeInTheDocument();
    act(() => { fireEvent.click(screen.getByRole('dialog')); });
    expect(screen.getByText(/BADGE DESBLOQUEADA/i)).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('mostra contador "1 / 2" quando há múltiplos eventos', () => {
    render(
      <CelebrationOverlay
        events={[
          { kind: 'streak', days: 3 },
          { kind: 'badge', badgeId: 'badge_first' },
        ]}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
  });

  it('auto-dismisses após 3200ms no último evento', async () => {
    const onDismiss = vi.fn();
    render(
      <CelebrationOverlay
        events={[{ kind: 'streak', days: 1 }]}
        onDismiss={onDismiss}
      />
    );
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(3200); });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('tem aria-modal e aria-label corretos', () => {
    render(
      <CelebrationOverlay events={[{ kind: 'streak', days: 1 }]} onDismiss={vi.fn()} />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Conquista');
  });

  it('retorna null quando events está vazio', () => {
    const { container } = render(
      <CelebrationOverlay events={[]} onDismiss={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });
});
