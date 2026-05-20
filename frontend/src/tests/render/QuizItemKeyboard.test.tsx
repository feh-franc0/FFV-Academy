import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('@/hooks/useGameState', () => ({
  useGameState: () => ({
    state: { completedModules: [], xp: 0, level: 1, streak: 0, badges: [] },
    levelInfo: null,
    dueCards: [],
    todayReviewCount: 0,
    dailyGoalMet: false,
    markComplete: vi.fn(),
  }),
}));

vi.mock('@/lib/engine', () => ({ saveQuizScore: vi.fn() }));

// ArticleDiscussion plugado em BaseModule precisa de AuthProvider — mock pra
// não interferir nestes testes de quiz/teclado.
vi.mock('@/components/ArticleDiscussion', () => ({
  ArticleDiscussion: () => null,
}));

import { BaseModule } from '@/components/base/BaseModule';
import type { Base, Trail, Module as ModuleData } from '@/lib/bases/types';
import { MEDVET_THEME } from '@/lib/bases/medvet/theme';

const MODULE: ModuleData = {
  slug: 'kb-test',
  num: 1,
  icon: '🧬',
  title: 'Quiz Keyboard',
  summary: 'teste',
  estimatedMin: 10,
  keyTerms: [],
  sections: [],
  quiz: [
    {
      question: 'Qual é a opção correta?',
      options: ['Alfa', 'Beta', 'Gama', 'Delta'],
      correct: 1,
      explanation: 'Beta é a resposta.',
      hint: 'Dica útil.',
    },
  ],
};

const TRAIL: Trail = {
  slug: 't',
  title: 'Trilha',
  description: '',
  icon: '📚',
  modules: [MODULE],
};

const BASE: Base = {
  slug: 'b',
  name: 'Base',
  area: 'Área',
  description: '',
  icon: '🧪',
  attribution: '',
  trails: [TRAIL],
};

function renderQuiz() {
  return render(
    <BaseModule
      base={BASE}
      trail={TRAIL}
      module={MODULE}
      theme={MEDVET_THEME}
      basePath="/b"
    />,
  );
}

describe('<QuizItem> — keyboard navigation', () => {
  afterEach(cleanup);

  it('renderiza <ul role="radiogroup"> com aria-labelledby pra pergunta', () => {
    renderQuiz();
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toBeInTheDocument();
    expect(radiogroup).toHaveAttribute('aria-labelledby', 'quiz-q-1');
  });

  it('cada opção é role="radio" com aria-checked=false inicialmente', () => {
    renderQuiz();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    radios.forEach(r => expect(r).toHaveAttribute('aria-checked', 'false'));
  });

  it('clicar marca aria-checked=true só no selecionado', async () => {
    const user = userEvent.setup();
    renderQuiz();
    const radios = screen.getAllByRole('radio');
    await user.click(radios[2]);
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
    expect(radios[3]).toHaveAttribute('aria-checked', 'false');
  });

  it('roving tabindex: só a primeira (ou selecionada) é tabbable', () => {
    renderQuiz();
    const radios = screen.getAllByRole('radio');
    // Antes de qualquer seleção: primeira tem tabindex=0, resto -1
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
    expect(radios[2]).toHaveAttribute('tabindex', '-1');
    expect(radios[3]).toHaveAttribute('tabindex', '-1');
  });

  it('atalho numérico 1-4 seleciona opção correspondente', async () => {
    const user = userEvent.setup();
    renderQuiz();
    // Foca o primeiro radio (forma correta de teclar dentro do radiogroup)
    screen.getAllByRole('radio')[0].focus();
    await user.keyboard('3');
    const radios = screen.getAllByRole('radio');
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
  });

  it('atalho letra A-D seleciona opção correspondente (case-insensitive)', async () => {
    const user = userEvent.setup();
    renderQuiz();
    screen.getAllByRole('radio')[0].focus();
    await user.keyboard('b');
    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('seta ↓/→ navega pra próxima opção (com wrap)', async () => {
    const user = userEvent.setup();
    renderQuiz();
    screen.getAllByRole('radio')[0].focus();
    // sem seleção → ArrowDown vai pra primeira (0)
    await user.keyboard('{ArrowDown}');
    let radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    // ArrowDown → 1
    await user.keyboard('{ArrowDown}');
    radios = screen.getAllByRole('radio');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    // Wrap: ArrowDown da 3 (4ª) → 0
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('seta ↑/← navega pra anterior (com wrap)', async () => {
    const user = userEvent.setup();
    renderQuiz();
    screen.getAllByRole('radio')[0].focus();
    // sem seleção → ArrowUp vai pra última (3)
    await user.keyboard('{ArrowUp}');
    const radios = screen.getAllByRole('radio');
    expect(radios[3]).toHaveAttribute('aria-checked', 'true');
  });

  it('botão "Pedir dica" tem aria-expanded=false e aria-controls', () => {
    renderQuiz();
    const hintBtn = screen.getByRole('button', { name: /Pedir dica/ });
    expect(hintBtn).toHaveAttribute('aria-expanded', 'false');
    expect(hintBtn).toHaveAttribute('aria-controls', 'quiz-q-1-hint');
  });

  it('hint container tem id correto + role="region" quando revelado', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole('button', { name: /Pedir dica/ }));
    const region = screen.getByRole('region', { name: /Dica da questão/ });
    expect(region).toHaveAttribute('id', 'quiz-q-1-hint');
  });

  it('teclado não navega depois de revelado (não pode mudar resposta)', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getAllByRole('radio')[1]);
    await user.click(screen.getByRole('button', { name: /Verificar resposta/ }));
    // Foca radio depois de revelado pra testar que teclado não muta
    const after = screen.getAllByRole('radio');
    after[1].focus();
    await user.keyboard('3');
    const radios = screen.getAllByRole('radio');
    // Opção 1 (B) continua marcada — teclado foi ignorado
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');
  });

  it('botão de opção tem min-height: 44px no inline style (touch target WCAG)', () => {
    renderQuiz();
    const radios = screen.getAllByRole('radio');
    radios.forEach(r => {
      // styling inline aplica min-height: 44px
      expect(r.style.minHeight).toBe('44px');
    });
  });
});
