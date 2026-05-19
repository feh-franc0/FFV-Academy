import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import { SimuladoRunner, type SimuladoQuestion, type SimuladoMeta } from '@/components/base/SimuladoRunner';

const META: SimuladoMeta = {
  title: 'Simulado Teste',
  description: 'Descrição do simulado.',
  totalQuestions: 3,
  passingScore: 70,
  estimatedMinutes: 30,
};

const QUESTIONS: SimuladoQuestion[] = [
  {
    id: 'q001',
    question: 'Pergunta um?',
    options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
    correct: 1,
    explanation: 'Explicação 1: a B está certa porque...',
    topic: 'Mendel',
    difficulty: 'easy',
    hint: 'Lembre da Lei da Segregação.',
  },
  {
    id: 'q002',
    question: 'Pergunta dois?',
    options: ['X', 'Y', 'Z', 'W'],
    correct: 0,
    explanation: 'Explicação 2: X é a resposta.',
    topic: 'Hardy-Weinberg',
    difficulty: 'medium',
  },
  {
    id: 'q003',
    question: 'Pergunta três?',
    options: ['Alfa', 'Beta', 'Gama', 'Delta'],
    correct: 3,
    explanation: 'Explicação 3: Delta porque...',
    topic: 'Melhoramento',
    difficulty: 'hard',
  },
];

function renderSim(slug = 'sim-test') {
  return render(<SimuladoRunner slug={slug} questions={QUESTIONS} meta={META} />);
}

describe('<SimuladoRunner>', () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  it('renderiza título, descrição e contagem de questões', () => {
    renderSim();
    expect(screen.getByRole('heading', { name: /Simulado Teste/i })).toBeInTheDocument();
    expect(screen.getByText(/Descrição do simulado/)).toBeInTheDocument();
    expect(screen.getAllByText(/Questão 00/)).toHaveLength(3);
  });

  it('renderiza todas as questões com seus 4 botões de alternativa', () => {
    renderSim();
    const lis = screen.getAllByRole('listitem');
    // 3 questões na ol + (cada questão tem ul com 4 lis para options)
    expect(lis.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('Opção A')).toBeInTheDocument();
    expect(screen.getByText('Delta')).toBeInTheDocument();
  });

  it('botão "Pedir dica" só aparece quando há hint na questão', () => {
    renderSim();
    const hintButtons = screen.getAllByRole('button', { name: /Pedir dica/i });
    // Q1 tem hint, Q2 e Q3 não
    expect(hintButtons).toHaveLength(1);
  });

  it('clicar em "Pedir dica" revela o texto da dica', async () => {
    const user = userEvent.setup();
    renderSim();
    expect(screen.queryByText(/Lembre da Lei da Segregação/)).not.toBeInTheDocument();
    const hintBtn = screen.getByRole('button', { name: /Pedir dica/i });
    await user.click(hintBtn);
    expect(screen.getByText(/Lembre da Lei da Segregação/)).toBeInTheDocument();
    // botão some, vira card
    expect(screen.queryByRole('button', { name: /Pedir dica/i })).not.toBeInTheDocument();
  });

  it('seleciona alternativa ao clicar', async () => {
    const user = userEvent.setup();
    renderSim();
    const btn = screen.getByRole('button', { name: /Opção B/ });
    await user.click(btn);
    // Não há marcação visual testável diretamente, mas o submit deve estar consistente
    expect(screen.getByRole('button', { name: /Submeter simulado \(1\/3\)/ })).toBeInTheDocument();
  });

  function clickOptionInQuestion(questionText: string, optionText: string) {
    const q = screen.getByText(questionText).closest('li')!;
    const btn = within(q).getByText(optionText).closest('button')!;
    return userEvent.setup().click(btn);
  }

  it('submete e mostra resultado com score por tópico', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderSim();
    // Q1 correta (B = idx 1), Q2 errada (Y = idx 1; correta era X idx 0), Q3 correta (Delta idx 3)
    await clickOptionInQuestion('Pergunta um?', 'Opção B');
    await clickOptionInQuestion('Pergunta dois?', 'Y');
    await clickOptionInQuestion('Pergunta três?', 'Delta');
    await user.click(screen.getByRole('button', { name: /Submeter simulado \(3\/3\)/ }));

    // 2 / 3 = 67% → reprovado (passing 70%)
    expect(screen.getByText(/2 de 3 acertos/)).toBeInTheDocument();
    expect(screen.getByText(/Reprovado · 67%/)).toBeInTheDocument();
    // Por tópico (cada topic aparece 2x: na questão + no resultado)
    expect(screen.getAllByText('Mendel').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hardy-Weinberg').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Melhoramento').length).toBeGreaterThan(0);
  });

  it('mostra explicações após submeter', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderSim();
    await clickOptionInQuestion('Pergunta um?', 'Opção B');
    await clickOptionInQuestion('Pergunta dois?', 'X');
    await clickOptionInQuestion('Pergunta três?', 'Delta');
    await user.click(screen.getByRole('button', { name: /Submeter/i }));

    expect(screen.getByText(/Explicação 1:/)).toBeInTheDocument();
    expect(screen.getByText(/Explicação 2:/)).toBeInTheDocument();
    expect(screen.getByText(/Explicação 3:/)).toBeInTheDocument();
    // Status por questão
    expect(screen.getAllByText(/✓ Correto/).length).toBe(3);
  });

  it('persiste respostas em localStorage', async () => {
    const user = userEvent.setup();
    renderSim('persist-test');
    await user.click(screen.getByRole('button', { name: /Opção B/ }));

    const raw = localStorage.getItem('ffv_sim_persist-test');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.answers).toEqual({ q001: 1 });
    expect(parsed.submitted).toBe(false);
  });

  it('persiste dicas reveladas em localStorage', async () => {
    const user = userEvent.setup();
    renderSim('hint-persist');
    await user.click(screen.getByRole('button', { name: /Pedir dica/i }));

    const raw = localStorage.getItem('ffv_sim_hint-persist');
    const parsed = JSON.parse(raw!);
    expect(parsed.hintsRevealed).toContain('q001');
  });

  it('botão de submeter mostra contagem correta', async () => {
    renderSim();
    expect(screen.getByRole('button', { name: /Submeter simulado \(0\/3\)/ })).toBeInTheDocument();
    await clickOptionInQuestion('Pergunta um?', 'Opção B');
    expect(screen.getByRole('button', { name: /Submeter simulado \(1\/3\)/ })).toBeInTheDocument();
    await clickOptionInQuestion('Pergunta dois?', 'X');
    expect(screen.getByRole('button', { name: /Submeter simulado \(2\/3\)/ })).toBeInTheDocument();
  });

  it('aprova quando todas as respostas estão certas', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderSim('passing-test');
    await clickOptionInQuestion('Pergunta um?', 'Opção B');
    await clickOptionInQuestion('Pergunta dois?', 'X');
    await clickOptionInQuestion('Pergunta três?', 'Delta');
    await user.click(screen.getByRole('button', { name: /Submeter/ }));
    expect(screen.getByText(/Aprovado · 100%/)).toBeInTheDocument();
    expect(screen.getByText(/3 de 3 acertos/)).toBeInTheDocument();
  });

  it('botão "Recomeçar" reseta state', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderSim('reset-test');
    await clickOptionInQuestion('Pergunta um?', 'Opção B');
    await clickOptionInQuestion('Pergunta dois?', 'X');
    await clickOptionInQuestion('Pergunta três?', 'Delta');
    await user.click(screen.getByRole('button', { name: /Submeter/ }));

    expect(screen.getByText(/Aprovado/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Recomeçar simulado/ }));
    expect(screen.queryByText(/Aprovado/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submeter simulado \(0\/3\)/ })).toBeInTheDocument();
  });

  it('exibe topic e difficulty em cada questão', () => {
    renderSim();
    expect(screen.getByText(/Mendel/)).toBeInTheDocument();
    expect(screen.getByText(/Hardy-Weinberg/)).toBeInTheDocument();
    const easyTags = screen.getAllByText('easy');
    expect(easyTags.length).toBeGreaterThan(0);
  });

  it('hidrata state do localStorage se existir', () => {
    const existing = {
      answers: { q001: 1 },
      hintsRevealed: ['q001'],
      submitted: false,
      startedAt: '2026-01-01T00:00:00Z',
    };
    localStorage.setItem('ffv_sim_hydrate-test', JSON.stringify(existing));
    renderSim('hydrate-test');
    // hint já revelada
    expect(screen.getByText(/Lembre da Lei da Segregação/)).toBeInTheDocument();
    // 1/3 já marcado
    expect(screen.getByRole('button', { name: /Submeter simulado \(1\/3\)/ })).toBeInTheDocument();
  });

  it('aria roles: questões usam botões como alternativas', () => {
    renderSim();
    const q1 = screen.getByText('Pergunta um?').closest('li')!;
    const buttons = within(q1).getAllByRole('button');
    // 1 hint + 4 alternativas = 5 buttons mínimo
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });

  // ── basePath/baseName props (Onda 1A modular fix) ────────────────────────
  describe('base-agnostic props', () => {
    it('default: back link aponta pra /medicina-veterinaria (compat legacy)', () => {
      render(<SimuladoRunner slug="legacy" questions={QUESTIONS} meta={META} />);
      const back = screen.getByRole('link', { name: /VOLTAR PARA/i });
      expect(back).toHaveAttribute('href', '/medicina-veterinaria');
      expect(back.textContent).toMatch(/MEDICINA VETERINÁRIA/);
    });

    it('com basePath/baseName customizados: back link respeita', () => {
      render(
        <SimuladoRunner
          slug="custom"
          questions={QUESTIONS}
          meta={META}
          basePath="/direito"
          baseName="Direito"
        />,
      );
      const back = screen.getByRole('link', { name: /VOLTAR PARA/i });
      expect(back).toHaveAttribute('href', '/direito');
      expect(back.textContent).toMatch(/VOLTAR PARA DIREITO/);
    });

    it('aplica uppercase no baseName com múltiplas palavras', () => {
      render(
        <SimuladoRunner
          slug="multi"
          questions={QUESTIONS}
          meta={META}
          basePath="/medicina"
          baseName="Medicina Humana"
        />,
      );
      const back = screen.getByRole('link', { name: /VOLTAR PARA/i });
      expect(back.textContent).toMatch(/VOLTAR PARA MEDICINA HUMANA/);
    });
  });
});
