import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudyHeatmap } from '@/components/StudyHeatmap';
import type { StudyDay } from '@/lib/engine';
import { isoDate } from '@/lib/srs';

function makeDay(offsetDays: number, xp: number, cards = 0, minutes = 0): StudyDay {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return { date: isoDate(d), xpEarned: xp, cardsReviewed: cards, minutes, modulesCompleted: 0 };
}

describe('<StudyHeatmap>', () => {
  it('renderiza sem erros com studyDays vazio', () => {
    render(<StudyHeatmap studyDays={[]} />);
    expect(screen.getByText(/HISTÓRICO DE ESTUDOS/i)).toBeInTheDocument();
    expect(screen.getByText(/0 dias ativos/i)).toBeInTheDocument();
  });

  it('mostra contagem correta de dias ativos', () => {
    const days: StudyDay[] = [
      makeDay(0, 100),
      makeDay(1, 50),
      makeDay(3, 0), // não ativo
    ];
    render(<StudyHeatmap studyDays={days} />);
    expect(screen.getByText(/2 dias ativos/i)).toBeInTheDocument();
  });

  it('mostra XP total formatado', () => {
    const days: StudyDay[] = [
      makeDay(0, 80),
      makeDay(1, 70),
    ];
    render(<StudyHeatmap studyDays={days} />);
    expect(screen.getByText(/150 XP/i)).toBeInTheDocument();
  });

  it('renderiza legenda de intensidade (Menos / Mais)', () => {
    render(<StudyHeatmap studyDays={[]} />);
    expect(screen.getByText('Menos')).toBeInTheDocument();
    expect(screen.getByText('Mais')).toBeInTheDocument();
  });

  it('tooltip de célula com XP > 0 inclui dados do dia', () => {
    const days: StudyDay[] = [makeDay(0, 120, 5, 30)];
    render(<StudyHeatmap studyDays={days} />);
    const cells = document.querySelectorAll('[title]');
    const xpCell = Array.from(cells).find(c => c.getAttribute('title')?.includes('120 XP'));
    expect(xpCell).toBeTruthy();
    expect(xpCell?.getAttribute('title')).toContain('5 cards');
    expect(xpCell?.getAttribute('title')).toContain('30 min');
  });

  it('respeita prop days para limitar o número de dias', () => {
    render(<StudyHeatmap studyDays={[]} days={28} />);
    expect(screen.getByText(/últimos 28 dias/i)).toBeInTheDocument();
  });
});
