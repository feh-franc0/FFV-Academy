/**
 * capture.ts — Captura expandida de screenshots da FFV Academy
 *
 * 20+ screenshots com automacao real:
 * - Navega pela plataforma inteira
 * - Interage com quiz (clica botoes, responde perguntas, submete)
 * - Abre Command Palette
 * - Alterna dark/light theme
 * - Simula usuario avancado com XP, badges, streak
 *
 * Pre-requisito: npm run dev rodando (localhost:3000)
 * Uso: npx tsx scripts/capture.ts
 */

import puppeteer, { type Page, type Browser } from 'puppeteer';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = resolve(__dirname, '../assets/screenshots');
const PUBLIC_DIR = resolve(__dirname, '../public/screenshots');
// Use static build (port 8080) — dev server Turbopack breaks React hydration in Puppeteer
const BASE_URL = process.env.CAPTURE_URL || 'http://127.0.0.1:8080';
const VIEWPORT = { width: 2560, height: 1440 };
const MAX_RETRIES = 3;

// ── Estado simulado do jogo ─────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];

const GAME_STATE_FULL = {
  schemaVersion: 1,
  xp: 1250,
  level: 6,
  streak: 21,
  lastStudyDate: today,
  completedModules: [
    // IA
    'o-que-e-ia', 'dados-o-combustivel', 'como-ia-aprende', 'redes-neurais',
    'o-que-e-llm', 'tokens', 'como-llm-funciona', 'prompt-engineering',
    // IA Alem do LLM
    'transformers', 'embeddings-vetores',
    // AI-Native
    'rag-fundamentos', 'context-engineering', 'agentes-padroes',
    // AWS
    'o-que-e-cloud', 'ec2-fundamentos', 'redes-aws', 'storage-aws',
    // DevOps
    'docker-completo', 'kubernetes-completo',
    // Claude
    'claude-code-primeiros-passos', 'claude-code-workflows',
    // Eng Software
    'arquitetura-limpa', 'design-patterns',
    // Fundamentos
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

// ── Helpers ─────────────────────────────────────────────────────────────

async function wait(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function injectState(page: Page, state: Record<string, unknown>, theme = 'dark') {
  // Inject plain JSON — engine.ts loadState() now handles plain JSON directly
  // (skipping LZString.decompress which can hang on raw JSON input)
  await page.evaluateOnNewDocument((stateStr, themeStr) => {
    localStorage.setItem('ffv_academy', stateStr);
    localStorage.setItem('ffv_theme', themeStr);
  }, JSON.stringify(state), theme);
}

/**
 * Navigate + inject state + reload approach for pages that need
 * localStorage to be read during React hydration (progresso, revisar).
 */
async function gotoWithState(page: Page, url: string, state: Record<string, unknown>, theme = 'dark') {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate((stateStr, themeStr) => {
    localStorage.setItem('ffv_academy', stateStr);
    localStorage.setItem('ffv_theme', themeStr);
  }, JSON.stringify(state), theme);
  await page.reload({ waitUntil: 'networkidle0' });
}

async function safeClick(page: Page, selector: string, timeout = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch {
    return false;
  }
}

async function scrollToSelector(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) { el.scrollIntoView({ behavior: 'instant', block: 'center' }); return true; }
    return false;
  }, selector);
}

async function scrollToText(page: Page, text: string): Promise<boolean> {
  return page.evaluate((txt) => {
    const all = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, button, span'));
    const el = all.find(e => e.textContent?.includes(txt));
    if (el) { el.scrollIntoView({ behavior: 'instant', block: 'center' }); return true; }
    return false;
  }, text);
}

async function screenshot(page: Page, name: string) {
  const path1 = resolve(SCREENSHOTS_DIR, `${name}.png`);
  const path2 = resolve(PUBLIC_DIR, `${name}.png`);
  await page.screenshot({ path: path1, type: 'png', fullPage: false });
  await page.screenshot({ path: path2, type: 'png', fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

// ── Capturas ────────────────────────────────────────────────────────────

interface CaptureStep {
  name: string;
  description: string;
  fn: (page: Page, browser: Browser) => Promise<void>;
}

const CAPTURES: CaptureStep[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // HOME — 3 capturas (hero, hubs, first-visit)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '01-home-hero',
    description: 'Home hero com estado avancado (returning user)',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await wait(2000);
      await screenshot(page, '01-home-hero');
    },
  },
  {
    name: '02-home-hubs',
    description: 'Home scroll ate secao de hubs tematicos',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await wait(1500);
      // Scroll ate hubs
      await scrollToText(page, 'Escolha') || await page.evaluate(() => window.scrollTo(0, 900));
      await wait(800);
      await screenshot(page, '02-home-hubs');
    },
  },
  {
    name: '03-home-trilhas',
    description: 'Home scroll ate cards de trilhas',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await page.evaluate(() => window.scrollTo(0, 1800));
      await wait(800);
      await screenshot(page, '03-home-trilhas');
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HUBS — 4 capturas (1 por hub)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '04-hub-ia',
    description: 'Hub Inteligencia Artificial',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/ia`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await screenshot(page, '04-hub-ia');
    },
  },
  {
    name: '05-hub-aws',
    description: 'Hub AWS Cloud',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/aws`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await screenshot(page, '05-hub-aws');
    },
  },
  {
    name: '06-hub-engenharia',
    description: 'Hub Engenharia de Software',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/engenharia`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await screenshot(page, '06-hub-engenharia');
    },
  },
  {
    name: '07-hub-claude',
    description: 'Hub Claude & Anthropic',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/claude-anthropic`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await screenshot(page, '07-hub-claude');
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TRILHAS — 3 capturas (IA, AWS, Claude)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '08-trilha-ia',
    description: 'Trilha Fundamentos da IA com progresso',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/fundamentos-da-ia`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await screenshot(page, '08-trilha-ia');
    },
  },
  {
    name: '09-trilha-aws',
    description: 'Trilha AWS Cloud Practitioner',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/aws-cloud-practitioner`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await screenshot(page, '09-trilha-aws');
    },
  },
  {
    name: '10-trilha-claude',
    description: 'Trilha Claude Code Masterclass',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/claude-code-masterclass`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await screenshot(page, '10-trilha-claude');
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ARTIGOS — 3 capturas (diferentes temas)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '11-artigo-llm',
    description: 'Artigo sobre LLM (header + TOC)',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/aprenda/o-que-e-llm`, { waitUntil: 'networkidle0' });
      await wait(2000);
      await screenshot(page, '11-artigo-llm');
    },
  },
  {
    name: '12-artigo-docker',
    description: 'Artigo Docker (header + conteudo)',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/aprenda/docker-completo`, { waitUntil: 'networkidle0' });
      await wait(2000);
      await screenshot(page, '12-artigo-docker');
    },
  },
  {
    name: '13-artigo-rag',
    description: 'Artigo RAG (engenharia AI-Native)',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/aprenda/rag-fundamentos`, { waitUntil: 'networkidle0' });
      await wait(2000);
      await screenshot(page, '13-artigo-rag');
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // QUIZ — 4 capturas (fluxo completo: CTA → perguntas → submit → resultado)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '14-quiz-cta',
    description: 'Quiz CTA — botao "Comecar quiz" antes de iniciar',
    fn: async (page) => {
      // Sem estado — simula usuario novo neste artigo
      await injectState(page, { ...GAME_STATE_FULL, quizScores: {}, completedModules: [] });
      await page.goto(`${BASE_URL}/aprenda/o-que-e-ia`, { waitUntil: 'networkidle0' });
      await wait(1500);
      // Scroll ate o quiz
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 800));
      await wait(1000);
      await scrollToText(page, 'Quiz rápido') || await scrollToText(page, 'quiz');
      await wait(500);
      await screenshot(page, '14-quiz-cta');
    },
  },
  {
    name: '15-quiz-perguntas',
    description: 'Quiz com perguntas visiveis (apos clicar comecar)',
    fn: async (page) => {
      await injectState(page, { ...GAME_STATE_FULL, quizScores: {}, completedModules: [] });
      await page.goto(`${BASE_URL}/aprenda/o-que-e-ia`, { waitUntil: 'networkidle0' });
      await wait(1500);
      // Scroll ate quiz e clica "Comecar quiz"
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 800));
      await wait(1000);
      // Clica no botao "Comecar quiz"
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent?.includes('Começar quiz'));
        if (btn) { btn.click(); return true; }
        return false;
      });
      if (clicked) {
        await wait(800);
        await scrollToText(page, 'Quiz');
        await wait(500);
      }
      await screenshot(page, '15-quiz-perguntas');
    },
  },
  {
    name: '16-quiz-respondendo',
    description: 'Quiz com respostas selecionadas (antes de submeter)',
    fn: async (page) => {
      await injectState(page, { ...GAME_STATE_FULL, quizScores: {}, completedModules: [] });
      await page.goto(`${BASE_URL}/aprenda/o-que-e-ia`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 800));
      await wait(1000);
      // Clica "Comecar quiz"
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent?.includes('Começar quiz'));
        if (btn) btn.click();
      });
      await wait(800);

      // Seleciona respostas (tenta clicar nas opcoes corretas)
      // O quiz tem botoes com texto das opcoes
      await page.evaluate(() => {
        const allButtons = Array.from(document.querySelectorAll('button'));
        // Para cada grupo de opcoes, clica na segunda opcao (geralmente a correta nos quizzes da plataforma)
        const optionButtons = allButtons.filter(b => {
          const text = b.textContent || '';
          return text.length > 10 && !text.includes('Começar') && !text.includes('Enviar') && !text.includes('Responda');
        });
        // Clica em opcoes distribuidas (1a de cada grupo)
        if (optionButtons.length >= 3) {
          optionButtons[1]?.click();  // Primeira pergunta
          // Pula 3 opcoes para a proxima pergunta
          if (optionButtons.length >= 7) optionButtons[5]?.click();
          if (optionButtons.length >= 11) optionButtons[9]?.click();
        }
      });
      await wait(800);
      await scrollToText(page, 'Quiz');
      await wait(500);
      await screenshot(page, '16-quiz-respondendo');
    },
  },
  {
    name: '17-quiz-resultado',
    description: 'Quiz resultado — apos submeter (XP ganho, badges)',
    fn: async (page) => {
      await injectState(page, { ...GAME_STATE_FULL, quizScores: {}, completedModules: [] });
      await page.goto(`${BASE_URL}/aprenda/o-que-e-ia`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 800));
      await wait(1000);
      // Comecar quiz
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        buttons.find(b => b.textContent?.includes('Começar quiz'))?.click();
      });
      await wait(800);

      // Seleciona todas as respostas
      await page.evaluate(() => {
        const allButtons = Array.from(document.querySelectorAll('button'));
        const optionButtons = allButtons.filter(b => {
          const text = b.textContent || '';
          return text.length > 10 && !text.includes('Começar') && !text.includes('Enviar') && !text.includes('Responda');
        });
        // Clica na segunda opcao de cada grupo de 4
        for (let i = 0; i < optionButtons.length; i += 4) {
          if (optionButtons[i + 1]) optionButtons[i + 1].click();
        }
      });
      await wait(500);

      // Submete o quiz
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submit = buttons.find(b => b.textContent?.includes('Enviar'));
        if (submit && !submit.disabled) submit.click();
      });
      await wait(1500); // Espera animacao de resultado
      await scrollToText(page, 'XP') || await scrollToText(page, 'trabalho') || await scrollToText(page, 'Perfeito');
      await wait(500);
      await screenshot(page, '17-quiz-resultado');
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PROGRESSO — 2 capturas (dashboard hero + detalhes)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '18-progresso-hero',
    description: 'Dashboard de progresso — hero com XP, nivel, streak',
    fn: async (page) => {
      await gotoWithState(page, `${BASE_URL}/progresso`, GAME_STATE_FULL);
      await wait(3000);
      await screenshot(page, '18-progresso-hero');
    },
  },
  {
    name: '19-progresso-badges',
    description: 'Dashboard scroll — badges e progresso por hub',
    fn: async (page) => {
      await gotoWithState(page, `${BASE_URL}/progresso`, GAME_STATE_FULL);
      await wait(3000);
      await page.evaluate(() => window.scrollTo(0, 800));
      await wait(1000);
      await screenshot(page, '19-progresso-badges');
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SRS REVIEW — 2 capturas (card e rating)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '20-srs-card',
    description: 'Revisao espacada — card de pergunta',
    fn: async (page) => {
      await gotoWithState(page, `${BASE_URL}/revisar`, GAME_STATE_FULL);
      await wait(3000);
      await screenshot(page, '20-srs-card');
    },
  },
  {
    name: '21-srs-resposta',
    description: 'Revisao espacada — apos revelar resposta (botoes de rating)',
    fn: async (page) => {
      await gotoWithState(page, `${BASE_URL}/revisar`, GAME_STATE_FULL);
      await wait(3000);
      // Click answer option to reveal
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const option = buttons.find(b => {
          const text = b.textContent || '';
          return text.length > 10 && !text.includes('Começar') && !text.includes('Buscar');
        });
        if (option) { option.click(); return; }
        const reveal = buttons.find(b =>
          b.textContent?.includes('Mostrar') || b.textContent?.includes('Revelar') ||
          b.textContent?.includes('Ver resposta') || b.textContent?.includes('resposta')
        );
        if (reveal) reveal.click();
      });
      await wait(1500);
      await screenshot(page, '21-srs-resposta');
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COMMAND PALETTE — 1 captura
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '22-command-palette',
    description: 'Command Palette aberta (Cmd+K)',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await wait(1500);
      // Abre command palette com Cmd+K
      await page.keyboard.down('Meta');
      await page.keyboard.press('k');
      await page.keyboard.up('Meta');
      await wait(1000);
      await screenshot(page, '22-command-palette');
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TEMA LIGHT — 2 capturas (home + artigo no light mode)
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '23-light-home',
    description: 'Home em tema claro',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL, 'light');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await wait(2000);
      await screenshot(page, '23-light-home');
    },
  },
  {
    name: '24-light-artigo',
    description: 'Artigo em tema claro',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL, 'light');
      await page.goto(`${BASE_URL}/aprenda/o-que-e-llm`, { waitUntil: 'networkidle0' });
      await wait(2000);
      await screenshot(page, '24-light-artigo');
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GLOSSARIO — 1 captura
  // ═══════════════════════════════════════════════════════════════════════
  {
    name: '25-glossario',
    description: 'Glossario tecnico',
    fn: async (page) => {
      await injectState(page, GAME_STATE_FULL);
      await page.goto(`${BASE_URL}/glossario`, { waitUntil: 'networkidle0' });
      await wait(1500);
      await screenshot(page, '25-glossario');
    },
  },
];

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  for (const dir of [SCREENSHOTS_DIR, PUBLIC_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  console.log('\n🎬 FFV Academy — Captura Expandida de Screenshots');
  console.log('═'.repeat(60));
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📐 Viewport: ${VIEWPORT.width}x${VIEWPORT.height}`);
  console.log(`📸 Total: ${CAPTURES.length} capturas`);
  console.log(`📂 Output: ${SCREENSHOTS_DIR}\n`);

  // Testa dev server (aceita qualquer status HTTP — so precisa responder)
  try {
    await fetch(BASE_URL);
    console.log('✅ Dev server respondendo\n');
  } catch {
    console.error('❌ Dev server nao esta rodando!');
    console.error('   Execute: cd .. && npm run dev\n');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: VIEWPORT,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let success = 0;
  let failed = 0;

  try {
    for (const capture of CAPTURES) {
      const page = await browser.newPage();
      await page.setViewport(VIEWPORT);
      page.setDefaultNavigationTimeout(90000); // 90s para primeira compilacao Turbopack
      page.setDefaultTimeout(30000);

      let captured = false;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`📸 [${capture.name}] ${capture.description}${attempt > 1 ? ` (tentativa ${attempt})` : ''}`);
          await capture.fn(page, browser);
          captured = true;
          success++;
          break;
        } catch (error) {
          console.log(`  ⚠ Falhou: ${error instanceof Error ? error.message : error}`);
          if (attempt === MAX_RETRIES) {
            console.log(`  ✗ Desistindo apos ${MAX_RETRIES} tentativas`);
            failed++;
          } else {
            await wait(2000);
          }
        }
      }

      await page.close();
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Concluido: ${success}/${CAPTURES.length} capturas`);
    if (failed > 0) console.log(`⚠️  ${failed} capturas falharam`);
    console.log(`📂 Screenshots em: ${SCREENSHOTS_DIR}\n`);

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
