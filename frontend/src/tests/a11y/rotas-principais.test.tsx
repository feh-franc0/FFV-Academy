import '@testing-library/jest-dom/vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeAll, describe, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { expectNoCriticalA11yViolations } from './axe-helper';
import { loadState } from '@/lib/engine';

/**
 * Acessibilidade das rotas que faltavam.
 *
 * Antes disto, três rotas tinham verificação com axe: home, busca e ranking. As
 * que ficaram de fora são justamente onde o usuário PASSA O TEMPO — a página de
 * módulo, que é 415 das rotas do site, e as telas de progresso, revisão e
 * preferências, que são a sessão de estudo inteira.
 *
 * O teste da página de módulo renderiza a árvore de blocos de um seed REAL, não
 * um bloco de exemplo. É a única forma de a verificação alcançar os primitives
 * de verdade — tabela comparativa, diagrama, quiz, fórmula anotada —, que é onde
 * problema de contraste e de rótulo costuma nascer.
 *
 * `region` fica desligado no helper: os clients são montados fora do `<main>` do
 * layout, e cobrar landmark de um componente solto acusaria violação em todos
 * eles por um motivo que não é deles.
 *
 * DUAS LIMITAÇÕES, para ninguém ler mais garantia aqui do que existe:
 *
 * 1. **jsdom não aplica CSS.** Elemento escondido por classe utilitária continua
 *    visível para o axe, então estes testes são mais rígidos que o navegador.
 *    Foi assim que o campo de importar backup em `/progresso` apareceu: em
 *    produção ele está fora da árvore de acessibilidade por `display: none`, mas
 *    não tinha nome acessível nenhum. Recebeu `aria-label` — a rigidez extra
 *    apontou algo que valia consertar, e é o motivo de eu não ter contornado o
 *    teste.
 * 2. **Só violações críticas.** Contraste, ordem de foco e navegação por teclado
 *    em fluxo real não são cobertos por render estático. Isto reduz a chance de
 *    regressão grosseira; não substitui auditoria manual.
 */

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
    logout: vi.fn(),
    // `requireLogin` é chamado num efeito de `/preferencias`; sem ele o
    // componente estoura antes de o axe ver qualquer coisa.
    requireLogin: vi.fn().mockResolvedValue(null),
  }),
}));

vi.mock('@/lib/leaderboard-api', () => ({
  getLeaderboard: vi.fn().mockResolvedValue({ weekStart: '2026-04-20', items: [] }),
  getMyRank: vi.fn().mockResolvedValue(null),
  getMyRankAll: vi.fn().mockResolvedValue([]),
  getPublicLeaderboard: vi.fn().mockResolvedValue({
    status: 'ok',
    dados: { period: 'weekly', entries: [], periodStart: '', periodEnd: '' },
  }),
}));

// Estado de jogo com progresso real: dashboard vazio esconde metade da tela, e
// metade da tela escondida é metade da acessibilidade não verificada.
//
// A base vem de `loadState()` com `localStorage` vazio — ou seja, o DEFAULT_STATE
// de verdade — em vez de um objeto escrito à mão. Escrever o estado à mão foi a
// primeira tentativa, e ela quebrou na hora: faltava `quests`, campo que entrou
// no schema depois. Mock copiado de um schema envelhece; mock derivado do schema
// acompanha.
const ESTADO = {
  ...loadState(),
  xp: 1250,
  level: 4,
  streak: 7,
  lastStudyDate: '2026-08-03',
  completedModules: ['rag-fundamentos', 'agentes-padroes'],
  quizScores: { 'rag-fundamentos': 100 },
  badges: ['primeiro-modulo'],
  totalStudyTime: 3600,
  startedAt: '2026-07-01',
  studyDays: [{ date: '2026-08-03', modules: 2, xp: 120 }],
  freezes: 2,
};

vi.mock('@/hooks/useGameState', () => ({
  useGameState: () => ({
    state: ESTADO,
    levelInfo: { level: 4, title: 'Praticante', xpAtual: 250, xpParaProximo: 500, progresso: 0.5 },
    dueCards: [],
    weeklyStats: { modules: 4, xp: 320, minutes: 90 },
    recommendations: [],
    refresh: vi.fn(),
    markComplete: vi.fn(),
    reviewOne: vi.fn(),
    loading: false,
  }),
}));

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
  if (typeof globalThis.matchMedia === 'undefined') {
    globalThis.matchMedia = ((q: string) => ({
      matches: false, media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof globalThis.matchMedia;
  }
});

afterEach(cleanup);

describe('a11y · rota de módulo (/aprenda/[slug])', () => {
  // Módulo escolhido por densidade: tem diagrama com passos, tabela
  // comparativa, blocos de código e os 3 quizzes. Cobre mais primitives por
  // render do que qualquer exemplo escrito à mão.
  const SEED = join(process.cwd(), '..', 'scripts', 'seeds', 'articles', 'sagas-2pc.json');

  it('a árvore de blocos de um seed real não tem violação crítica', async () => {
    const { BlockTree } = await import('@/components/article/BlockRenderer');
    const doc = JSON.parse(readFileSync(SEED, 'utf-8'));
    const { container } = render(<BlockTree blocks={doc.blocks} />);
    await expectNoCriticalA11yViolations(container);
  });
});

describe('a11y · /progresso', () => {
  it('dashboard com progresso não tem violação crítica', async () => {
    const { ProgressoClient } = await import('@/components/ProgressoClient');
    const { container } = render(<ProgressoClient />);
    await expectNoCriticalA11yViolations(container);
  });
});

describe('a11y · /revisar', () => {
  it('sessão de revisão sem cartas vencidas não tem violação crítica', async () => {
    const { ReviewClient } = await import('@/components/ReviewClient');
    const { container } = render(<ReviewClient />);
    await expectNoCriticalA11yViolations(container);
  });
});

describe('a11y · /preferencias', () => {
  it('a tela de dados da conta não tem violação crítica', async () => {
    const { PreferenciasClient } = await import('@/app/preferencias/PreferenciasClient');
    const { container } = render(<PreferenciasClient />);
    await expectNoCriticalA11yViolations(container);
  });
});

describe('a11y · /explorar', () => {
  it('a descoberta por hub e trilha não tem violação crítica', async () => {
    const { ExplorarClient } = await import('@/app/explorar/ExplorarClient');
    const { container } = render(<ExplorarClient />);
    await expectNoCriticalA11yViolations(container);
  });
});
