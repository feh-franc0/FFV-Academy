/**
 * state.ts — Estado de jogo compartilhado entre capture.ts (Puppeteer) e record-beats.ts (Playwright)
 *
 * Simula um usuario avancado (21 dias de streak, 1250 XP, 25 modulos completos).
 * Usado para renderizar a plataforma em estado realistico nos videos.
 */

const today = new Date().toISOString().split('T')[0];

export const GAME_STATE_FULL = {
  schemaVersion: 1,
  xp: 1250,
  level: 6,
  streak: 21,
  lastStudyDate: today,
  completedModules: [
    'o-que-e-ia', 'dados-o-combustivel', 'como-ia-aprende', 'redes-neurais',
    'o-que-e-llm', 'tokens', 'como-llm-funciona', 'prompt-engineering',
    'transformers', 'embeddings-vetores',
    'rag-fundamentos', 'context-engineering', 'agentes-padroes',
    'o-que-e-cloud', 'ec2-fundamentos', 'redes-aws', 'storage-aws',
    'docker-completo', 'kubernetes-completo',
    'claude-code-primeiros-passos', 'claude-code-workflows',
    'arquitetura-limpa', 'design-patterns',
    'como-computador-funciona-cpu', 'http-do-zero',
  ],
  quizScores: {
    'o-que-e-ia': { score: 3, total: 3, perfect: true },
    'dados-o-combustivel': { score: 3, total: 3, perfect: true },
    'como-ia-aprende': { score: 2, total: 3, perfect: false },
    'redes-neurais': { score: 3, total: 3, perfect: true },
    'o-que-e-llm': { score: 3, total: 3, perfect: true },
    'tokens': { score: 3, total: 3, perfect: true },
    'prompt-engineering': { score: 2, total: 3, perfect: false },
    'o-que-e-cloud': { score: 3, total: 3, perfect: true },
    'docker-completo': { score: 3, total: 3, perfect: true },
    'kubernetes-completo': { score: 2, total: 3, perfect: false },
    'rag-fundamentos': { score: 3, total: 3, perfect: true },
    'claude-code-primeiros-passos': { score: 3, total: 3, perfect: true },
    'arquitetura-limpa': { score: 3, total: 3, perfect: true },
    'http-do-zero': { score: 3, total: 3, perfect: true },
  },
  badges: [
    'first_step', 'quiz_perfect', 'streak_3', 'streak_7',
    'trail1_done', 'trail4_done', 'trail7_done',
  ],
  totalStudyTime: 960,
  startedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  reviewCards: [
    {
      id: 'o-que-e-ia_q0', slug: 'o-que-e-ia', title: 'O que é Inteligência Artificial?',
      trailColor: '#58a6ff',
      question: 'Qual é a principal diferença entre IA fraca e IA forte?',
      options: ['IA fraca é mais barata', 'IA fraca resolve tarefas específicas, IA forte teria consciência geral', 'IA forte usa mais dados', 'Não existe diferença real'],
      correct: 1, explanation: 'IA fraca (narrow AI) resolve tarefas específicas. IA forte (AGI) teria capacidade cognitiva geral.',
      easeFactor: 2.6, interval: 7, repetition: 3, dueDate: today, lastReview: null,
    },
    {
      id: 'docker-completo_q1', slug: 'docker-completo', title: 'Docker Completo',
      trailColor: '#79c0ff',
      question: 'Qual comando cria e inicia um container Docker?',
      options: ['docker build', 'docker run', 'docker start', 'docker create'],
      correct: 1, explanation: 'docker run combina create + start em um único comando.',
      easeFactor: 2.5, interval: 3, repetition: 2, dueDate: today, lastReview: null,
    },
    {
      id: 'rag-fundamentos_q0', slug: 'rag-fundamentos', title: 'RAG: Fundamentos',
      trailColor: '#d2a8ff',
      question: 'O que significa RAG?',
      options: ['Random Access Generation', 'Retrieval-Augmented Generation', 'Real-time AI Gateway', 'Recursive Agent Graph'],
      correct: 1, explanation: 'RAG = Retrieval-Augmented Generation, combina busca + geração.',
      easeFactor: 2.5, interval: 1, repetition: 1, dueDate: today, lastReview: null,
    },
  ],
  archivedCards: [],
  studyDays: Array.from({ length: 21 }, (_, i) => ({
    date: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minutes: 15 + Math.floor(Math.random() * 30),
    xpEarned: 30 + Math.floor(Math.random() * 70),
    cardsReviewed: 2 + Math.floor(Math.random() * 5),
    modulesCompleted: i % 3 === 0 ? 1 : 0,
  })),
  freezes: 2,
  dailyGoal: 5,
  lastReviewDate: today,
  lastArticle: {
    slug: 'agentes-padroes', title: 'Padrões de Agentes de IA', icon: '🤖',
    trailName: 'Engenharia AI-Native', trailColor: '#d2a8ff',
    readTime: 12, xp: 80, href: '/aprenda/agentes-padroes',
    at: new Date().toISOString(), progress: 1,
  },
  preferredHub: 'hub-ia',
  onboardedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  articleProgress: Object.fromEntries(
    ['o-que-e-ia', 'dados-o-combustivel', 'como-ia-aprende', 'redes-neurais',
     'o-que-e-llm', 'tokens', 'prompt-engineering', 'o-que-e-cloud',
     'docker-completo', 'kubernetes-completo', 'rag-fundamentos',
     'claude-code-primeiros-passos', 'arquitetura-limpa', 'http-do-zero',
     'agentes-padroes', 'context-engineering'].map(s => [s, 1])
  ),
};

/**
 * Estado sem conquistas (para gravar onboarding / usuario novo).
 */
export const GAME_STATE_EMPTY = {
  ...GAME_STATE_FULL,
  xp: 0,
  level: 0,
  streak: 0,
  completedModules: [],
  quizScores: {},
  badges: [],
  reviewCards: [],
  articleProgress: {},
  studyDays: [],
  lastArticle: null,
};

// ── Helpers compartilhados (page-agnostic: funcionam em Puppeteer e Playwright) ──

type PageLike = {
  evaluate: (<Args extends unknown[], R>(fn: (...args: Args) => R, ...args: Args) => Promise<R>) &
    (<R>(fn: () => R) => Promise<R>);
  waitForSelector: (sel: string, opts?: { timeout?: number }) => Promise<unknown>;
  click: (sel: string) => Promise<void>;
};

export async function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Injeta estado + tema ANTES de qualquer navegacao (via init script).
 * Funciona em Puppeteer (page.evaluateOnNewDocument) e Playwright (context.addInitScript).
 * Retorna a string de script que voce passa ao initScript do driver.
 */
export function buildInitScript(state: Record<string, unknown>, theme: 'dark' | 'light' = 'dark'): string {
  const stateStr = JSON.stringify(state);
  const themeStr = theme;
  return `(() => { try {
    localStorage.setItem('ffv_academy', ${JSON.stringify(stateStr)});
    localStorage.setItem('ffv_theme', ${JSON.stringify(themeStr)});
  } catch (e) {} })();`;
}

export async function safeClick(page: PageLike, selector: string, timeout = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch {
    return false;
  }
}

export async function scrollToSelector(page: PageLike, selector: string): Promise<boolean> {
  return page.evaluate((sel: string) => {
    const el = document.querySelector(sel);
    if (el) { el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'center' }); return true; }
    return false;
  }, selector);
}

export async function scrollToText(page: PageLike, text: string): Promise<boolean> {
  return page.evaluate((txt: string) => {
    const all = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, button, span'));
    const el = all.find(e => e.textContent?.includes(txt));
    if (el) { el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'center' }); return true; }
    return false;
  }, text);
}

export async function clickByText(page: PageLike, text: string): Promise<boolean> {
  return page.evaluate((txt: string) => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const btn = buttons.find(b => b.textContent?.includes(txt)) as HTMLElement | undefined;
    if (btn) { btn.click(); return true; }
    return false;
  }, text);
}
