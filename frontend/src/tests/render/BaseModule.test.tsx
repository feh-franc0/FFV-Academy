import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const markCompleteMock = vi.fn();
vi.mock('@/hooks/useGameState', () => ({
  useGameState: () => ({
    state: {
      completedModules: [],
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
    },
    levelInfo: null,
    dueCards: [],
    todayReviewCount: 0,
    dailyGoalMet: false,
    markComplete: markCompleteMock,
  }),
}));

vi.mock('@/lib/engine', () => ({
  saveQuizScore: vi.fn(),
}));

import { BaseModule } from '@/components/base/BaseModule';
import type { Base, Trail, Module as ModuleData } from '@/lib/bases/types';
import { MEDVET_THEME } from '@/lib/bases/medvet/theme';

const MODULE: ModuleData = {
  slug: 'mod-test',
  num: 1,
  icon: '🧬',
  title: 'Módulo de Teste',
  summary: 'Resumo do módulo.',
  estimatedMin: 15,
  keyTerms: [{ term: 'Gene', definition: 'Unidade da hereditariedade.' }],
  sections: [
    { kind: 'intro', body: 'Texto intro.' },
    { kind: 'concept', title: 'Conceito', body: 'Corpo do conceito.' },
    { kind: 'summary', bullets: ['Bullet 1', 'Bullet 2'] },
  ],
  quiz: [
    {
      question: 'Primeira pergunta?',
      options: ['Aaa', 'Bbb', 'Ccc', 'Ddd'],
      correct: 1,
      explanation: 'Explicação detalhada da Bbb.',
      hint: 'Pense bem no conceito X antes.',
    },
    {
      question: 'Segunda pergunta?',
      options: ['Foo', 'Bar', 'Baz', 'Qux'],
      correct: 0,
      explanation: 'Foo é a certa.',
    },
  ],
};

const TRAIL: Trail = {
  slug: 'trail-test',
  title: 'Trilha Teste',
  description: 'Trilha.',
  icon: '📚',
  modules: [MODULE],
};

const BASE: Base = {
  slug: 'test-base',
  name: 'Base Teste',
  area: 'Área',
  description: 'Descrição.',
  icon: '🧪',
  attribution: 'Atribuição.',
  trails: [TRAIL],
};

function renderModule() {
  return render(
    <BaseModule
      base={BASE}
      trail={TRAIL}
      module={MODULE}
      theme={MEDVET_THEME}
      basePath="/base-test"
    />,
  );
}

describe('<BaseModule>', () => {
  beforeEach(() => {
    markCompleteMock.mockClear();
  });

  afterEach(() => cleanup());

  it('renderiza título do módulo, trilha e sumário', () => {
    renderModule();
    expect(screen.getByRole('heading', { name: /Módulo de Teste/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Trilha Teste/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Resumo do módulo/)).toBeInTheDocument();
  });

  it('renderiza key terms', () => {
    renderModule();
    expect(screen.getByText('Gene')).toBeInTheDocument();
    expect(screen.getByText(/Unidade da hereditariedade/)).toBeInTheDocument();
  });

  it('renderiza section intro + concept + summary', () => {
    renderModule();
    expect(screen.getByText('Texto intro.')).toBeInTheDocument();
    expect(screen.getByText('Conceito')).toBeInTheDocument();
    expect(screen.getByText('Bullet 1')).toBeInTheDocument();
  });

  it('renderiza todas as questões do quiz', () => {
    renderModule();
    expect(screen.getByText('Primeira pergunta?')).toBeInTheDocument();
    expect(screen.getByText('Segunda pergunta?')).toBeInTheDocument();
  });

  it('botão "Pedir dica" aparece apenas em questões com hint', () => {
    renderModule();
    const hintButtons = screen.getAllByRole('button', { name: /Pedir dica/ });
    expect(hintButtons).toHaveLength(1);
  });

  it('clicar em "Pedir dica" revela a dica', async () => {
    const user = userEvent.setup();
    renderModule();
    expect(screen.queryByText(/Pense bem no conceito X/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Pedir dica/ }));
    expect(screen.getByText(/Pense bem no conceito X/)).toBeInTheDocument();
  });

  it('selecionar opção e revelar mostra explicação', async () => {
    const user = userEvent.setup();
    renderModule();
    const q1 = screen.getByText('Primeira pergunta?').closest('li')!;
    const optB = within(q1).getByText('Bbb').closest('button')!;
    await user.click(optB);
    const verify = within(q1).getByRole('button', { name: /Verificar resposta/i });
    await user.click(verify);
    expect(within(q1).getByText(/Explicação detalhada da Bbb/)).toBeInTheDocument();
    expect(within(q1).getByText(/✓ Correto/)).toBeInTheDocument();
  });

  it('explicação aparece mesmo quando resposta é errada', async () => {
    const user = userEvent.setup();
    renderModule();
    const q1 = screen.getByText('Primeira pergunta?').closest('li')!;
    const optA = within(q1).getByText('Aaa').closest('button')!;
    await user.click(optA);
    await user.click(within(q1).getByRole('button', { name: /Verificar resposta/i }));
    expect(within(q1).getByText(/× Não foi dessa vez/)).toBeInTheDocument();
    expect(within(q1).getByText(/Explicação detalhada da Bbb/)).toBeInTheDocument();
  });

  it('completar TODAS as questões dispara markComplete uma vez', async () => {
    const user = userEvent.setup();
    renderModule();
    const q1 = screen.getByText('Primeira pergunta?').closest('li')!;
    const q2 = screen.getByText('Segunda pergunta?').closest('li')!;

    await user.click(within(q1).getByText('Bbb').closest('button')!);
    await user.click(within(q1).getByRole('button', { name: /Verificar resposta/i }));
    expect(markCompleteMock).not.toHaveBeenCalled();

    await user.click(within(q2).getByText('Foo').closest('button')!);
    await user.click(within(q2).getByRole('button', { name: /Verificar resposta/i }));

    expect(markCompleteMock).toHaveBeenCalledTimes(1);
    expect(markCompleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'mod-test',
        title: 'Módulo de Teste',
        quiz: expect.any(Array),
      }),
    );
  });

  it('link "VOLTAR PARA" aponta para a base', () => {
    renderModule();
    const back = screen.getByRole('link', { name: /VOLTAR PARA/i });
    expect(back.getAttribute('href')).toBe('/base-test');
  });
});
