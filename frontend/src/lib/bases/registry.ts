/**
 * BaseRegistry — single source of truth de TODAS as bases de conhecimento
 * disponíveis na FFV Academy.
 *
 * Adicionar uma base = adicionar uma entrada aqui (1 arquivo `BaseConfig`
 * em `lib/bases/<slug>/config.ts`). O `AppChrome`, `BaseProvider` e router
 * todos descobrem bases novas automaticamente via este registro.
 *
 * Hoje carregamos os configs estaticamente. No futuro, configs podem vir do
 * endpoint `GET /api/v1/bases/{slug}` e o registry vira um cache hidratável.
 */

import type { BaseConfig, FooterLinkItem } from './types';
import { TECH_NAV_ITEMS } from './tecnologia/nav';
import { MEDVET_NAV_ITEMS } from './medvet/nav';
import { MEDVET_BASE } from './medvet';
import { NEUROCIENCIA_BASE } from './neurociencia';
import { NEUROCIENCIA_NAV_ITEMS } from './neurociencia/nav';
import { NEUROCIENCIA_THEME } from './neurociencia/theme';
import { DEFAULT_THEME } from './theme';
import { MEDVET_THEME } from './medvet/theme';
import { TECH_TOTAL_TRAILS, TECH_TOTAL_MODULES, TECH_TOTAL_HUBS } from './tecnologia';

// ──────────────────────────────────────────────────────────────────────
// Tech BaseConfig
// ──────────────────────────────────────────────────────────────────────

const TECH_FOOTER_CONTENT: FooterLinkItem[] = [
  { label: 'News', href: '/news' },
  { label: 'Simulados', href: '/simulados' },
  { label: 'Progresso', href: '/progresso' },
  { label: 'Revisar (SRS)', href: '/revisar' },
  { label: 'Glossário', href: '/glossario' },
  { label: 'Playlists', href: '/playlists' },
  { label: 'Roadmaps', href: '/roadmaps' },
];

const TECH_FOOTER_HUBS: FooterLinkItem[] = [
  { label: 'IA', href: '/ia' },
  { label: 'AWS', href: '/aws' },
  { label: 'Engenharia', href: '/engenharia' },
  { label: 'Claude', href: '/claude-anthropic' },
];

const TECH_CONFIG: BaseConfig = {
  slug: 'tecnologia',
  name: 'Tecnologia',
  area: 'Programação · IA · AWS · Engenharia',
  description:
    'Sistemas distribuídos, IA aplicada, AWS, frontend, backend, dados. Trilhas completas com revisão espaçada e gamificação.',
  icon: '💻',
  basePath: '/tecnologia',
  status: 'live',
  attribution: 'Currículo curado por Fernando Franco Valle.',
  trails: [], // tech usa o CURRICULUM global; trails ficam vazias aqui pra retrocompat
  theme: { ...DEFAULT_THEME, accent: '#1e3a8a', accentLight: '#3b82f6' },
  mascot: {
    emoji: '💻',
    name: 'FFV',
    greeting: 'Bora estudar engenharia de verdade?',
  },
  microcopy: {
    ctaPrimary: 'Começar trilha',
    ctaSecondary: 'Explorar hubs',
    emptyState: 'Sem módulos por aqui ainda.',
    searchPlaceholder: 'Buscar módulos, trilhas, hubs…',
    xpUnitSingular: 'XP',
    xpUnitPlural: 'XP',
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
  },
  slogans: {
    hero: 'Engenharia para a era da IA',
    sub: 'Internals, sistemas distribuídos, IA aplicada — sem hype.',
    cta: 'Começar agora',
  },
  nav: { hubNavItems: TECH_NAV_ITEMS, hideGlobalContentNav: false },
  footer: {
    hubColumnTitle: 'Hubs',
    hubLinks: TECH_FOOTER_HUBS,
    contentColumnTitle: 'Conteúdo',
    contentLinks: TECH_FOOTER_CONTENT,
    mobilePrimary: [
      { label: 'Trilhas', href: '/explorar' },
      { label: 'News', href: '/news' },
      { label: 'Simulados', href: '/simulados' },
    ],
  },
  features: { gamification: 'global', srs: true, quizzes: true, community: true },
};

// Métricas estatísticas — não fazem parte do BaseConfig "viajante" mas vêm aqui
// pra consumo direto pelos componentes que precisam (KnowledgeBaseHome stats).
export const TECH_STATS = {
  trails: TECH_TOTAL_TRAILS,
  modules: TECH_TOTAL_MODULES,
  hubs: TECH_TOTAL_HUBS,
};

// ──────────────────────────────────────────────────────────────────────
// Medvet BaseConfig — promove o MEDVET_BASE existente a BaseConfig completo
// ──────────────────────────────────────────────────────────────────────

const MEDVET_FOOTER_HUBS: FooterLinkItem[] = (MEDVET_BASE.hubs ?? []).map(h => ({
  label: h.name,
  href: `/medicina-veterinaria#${h.slug}`,
}));

const MEDVET_FOOTER_CONTENT: FooterLinkItem[] = [
  { label: 'Trilha de Genética', href: '/medicina-veterinaria' },
  { label: 'Simulado 100 questões', href: '/medicina-veterinaria/simulado-genetica' },
  { label: 'Progresso', href: '/progresso' },
  { label: 'Revisar (SRS)', href: '/revisar' },
];

const MEDVET_CONFIG: BaseConfig = {
  ...MEDVET_BASE,
  basePath: '/medicina-veterinaria',
  status: 'live',
  theme: MEDVET_THEME,
  mascot: {
    emoji: '🐾',
    name: 'Lupa',
    greeting: 'Oi! Bora destrinchar genética veterinária?',
  },
  microcopy: {
    ctaPrimary: 'Começar trilha',
    ctaSecondary: 'Ver simulado',
    emptyState: 'Sem módulos por aqui ainda.',
    searchPlaceholder: 'Buscar módulos, trilhas…',
    xpUnitSingular: 'XP',
    xpUnitPlural: 'XP',
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
  },
  slogans: {
    hero: 'Medicina Veterinária com profundidade real',
    sub: 'Da genética básica ao melhoramento — trilhas completas, exercícios e revisão.',
    cta: 'Começar trilha de Genética',
  },
  nav: { hubNavItems: MEDVET_NAV_ITEMS, hideGlobalContentNav: true },
  footer: {
    hubColumnTitle: 'Hubs temáticos',
    hubLinks: MEDVET_FOOTER_HUBS,
    contentColumnTitle: 'Conteúdo',
    contentLinks: MEDVET_FOOTER_CONTENT,
    mobilePrimary: [
      { label: 'Trilha', href: '/medicina-veterinaria' },
      { label: 'Simulado', href: '/medicina-veterinaria/simulado-genetica' },
      { label: 'Progresso', href: '/progresso' },
      { label: 'Revisar', href: '/revisar' },
    ],
  },
  simulados: [
    {
      slug: 'simulado-genetica',
      title: 'Simulado 100 questões de Genética',
      href: '/medicina-veterinaria/simulado-genetica',
    },
  ],
  features: { gamification: 'global', srs: true, quizzes: true, community: false },
};

// ──────────────────────────────────────────────────────────────────────
// Neurociência BaseConfig — base profissional vertical similar à medvet,
// nascida da solicitação real de estudante de PUC Neurociência sobre
// "Neurociência aplicada a Marketing". Tem trilha única (Neuromarketing)
// com 4 hubs temáticos e 8 módulos.
// ──────────────────────────────────────────────────────────────────────

const NEUROCIENCIA_FOOTER_HUBS: FooterLinkItem[] = (NEUROCIENCIA_BASE.hubs ?? []).map(h => ({
  label: h.name,
  href: `/neurociencia/hub/${h.slug}/`,
}));

const NEUROCIENCIA_FOOTER_CONTENT: FooterLinkItem[] = [
  { label: 'Trilha Neuromarketing', href: '/neurociencia' },
  { label: 'Progresso', href: '/progresso' },
  { label: 'Revisar (SRS)', href: '/revisar' },
];

const NEUROCIENCIA_CONFIG: BaseConfig = {
  ...NEUROCIENCIA_BASE,
  basePath: '/neurociencia',
  status: 'live',
  theme: NEUROCIENCIA_THEME,
  mascot: {
    emoji: '🧠',
    name: 'Neo',
    greeting: 'Oi! Pronto pra entender por que seu cérebro decide o que decide?',
  },
  microcopy: {
    ctaPrimary: 'Começar trilha',
    ctaSecondary: 'Explorar hubs',
    emptyState: 'Sem módulos por aqui ainda.',
    searchPlaceholder: 'Buscar módulos, trilhas, conceitos…',
    xpUnitSingular: 'XP',
    xpUnitPlural: 'XP',
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
  },
  slogans: {
    hero: 'Neurociência aplicada ao marketing — com profundidade real',
    sub: 'Kahneman, Cialdini, Schultz, Knutson. 8 módulos sequenciais com exemplos do dia a dia, analogias lúdicas e exercícios.',
    cta: 'Começar pelo módulo 01',
  },
  nav: { hubNavItems: NEUROCIENCIA_NAV_ITEMS, hideGlobalContentNav: true },
  footer: {
    hubColumnTitle: 'Hubs temáticos',
    hubLinks: NEUROCIENCIA_FOOTER_HUBS,
    contentColumnTitle: 'Conteúdo',
    contentLinks: NEUROCIENCIA_FOOTER_CONTENT,
    mobilePrimary: [
      { label: 'Trilha', href: '/neurociencia' },
      { label: 'Simulado', href: '/neurociencia/simulado-neuromarketing' },
      { label: 'Progresso', href: '/progresso' },
      { label: 'Revisar', href: '/revisar' },
    ],
  },
  simulados: [
    {
      slug: 'simulado-neuromarketing',
      title: 'Simulado 100 questões de Neuromarketing',
      href: '/neurociencia/simulado-neuromarketing',
    },
  ],
  features: { gamification: 'global', srs: true, quizzes: true, community: false },
};

// ──────────────────────────────────────────────────────────────────────
// Bases do Profissional Digital — 6 áreas que saíram do antigo
// hub-profissional-digital e viraram bases independentes. Cada uma tem
// chrome isolado: header, footer, nav, mascote, microcopy, tema.
//
// Helper `makeProfissionalBase` evita boilerplate — toda essa família
// compartilha estrutura (mesmo footer global, mesmas features, mesma
// gamificação) e varia só na identidade visual e nos slogans.
// ──────────────────────────────────────────────────────────────────────

interface ProfissionalBaseSeed {
  slug: string;
  name: string;
  shortLabel: string;
  basePath: string;
  area: string;
  description: string;
  icon: string;
  iconName: string;
  accent: string;
  accentLight: string;
  mascotName: string;
  mascotGreeting: string;
  slogans: { hero: string; sub: string; cta: string };
  microcopy: {
    moduleNoun: string;
    trailNoun: string;
    searchPlaceholder: string;
  };
}

function makeProfissionalBase(seed: ProfissionalBaseSeed): BaseConfig {
  const navItem: FooterLinkItem = { label: seed.shortLabel, href: seed.basePath };
  const ownContent: FooterLinkItem[] = [
    { label: 'Progresso', href: '/progresso' },
    { label: 'Revisar (SRS)', href: '/revisar' },
    { label: 'Glossário', href: '/glossario' },
  ];
  return {
    slug: seed.slug,
    name: seed.name,
    area: seed.area,
    description: seed.description,
    icon: seed.icon,
    basePath: seed.basePath,
    status: 'live',
    attribution: 'Currículo curado por Fernando Franco Valle.',
    trails: [],
    theme: {
      ...DEFAULT_THEME,
      accent: seed.accent,
      accentLight: seed.accentLight,
      hubColors: [seed.accent, seed.accent, seed.accent, seed.accent],
    },
    mascot: {
      emoji: seed.icon,
      name: seed.mascotName,
      greeting: seed.mascotGreeting,
    },
    microcopy: {
      ctaPrimary: 'Começar trilha',
      ctaSecondary: 'Explorar conteúdo',
      emptyState: 'Sem módulos por aqui ainda.',
      searchPlaceholder: seed.microcopy.searchPlaceholder,
      xpUnitSingular: 'XP',
      xpUnitPlural: 'XP',
      moduleNoun: seed.microcopy.moduleNoun,
      trailNoun: seed.microcopy.trailNoun,
    },
    slogans: seed.slogans,
    nav: {
      hubNavItems: [
        { href: seed.basePath, label: seed.shortLabel, color: seed.accent, iconName: seed.iconName },
      ],
      hideGlobalContentNav: true,
    },
    footer: {
      hubColumnTitle: seed.shortLabel,
      hubLinks: [navItem],
      contentColumnTitle: 'Conteúdo',
      contentLinks: ownContent,
      mobilePrimary: [
        { label: seed.shortLabel, href: seed.basePath },
        { label: 'Progresso', href: '/progresso' },
        { label: 'Revisar', href: '/revisar' },
      ],
    },
    features: { gamification: 'global', srs: true, quizzes: true, community: true },
  };
}

const CARREIRA_CONFIG = makeProfissionalBase({
  slug: 'carreira',
  name: 'Carreira & Liderança',
  shortLabel: 'Carreira',
  basePath: '/carreira',
  area: 'Portfólio · Vagas · Entrevista · Promoção',
  description:
    'Carreira profissional como sistema: portfólio, busca de vagas no Brasil e fora, entrevista comportamental, negociação salarial e promoção.',
  icon: '🎯',
  iconName: 'target',
  accent: '#f472b6',
  accentLight: '#f9a8d4',
  mascotName: 'Ana',
  mascotGreeting: 'Oi! Bora dirigir a tua carreira em vez de torcer pela sorte?',
  slogans: {
    hero: 'Carreira como sistema, não como sorte',
    sub: 'Portfólio, busca de vagas, entrevista e promoção — o passo a passo de quem cresce de propósito.',
    cta: 'Começar pela base da carreira',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de carreira…',
  },
});

const COMUNICACAO_CONFIG = makeProfissionalBase({
  slug: 'comunicacao',
  name: 'Comunicação',
  shortLabel: 'Comunicação',
  basePath: '/comunicacao',
  area: 'Falar em público · Escrita profissional · Reuniões · Feedback',
  description:
    'Comunicação humana e escrita profissional: falar em público, conduzir reuniões, storytelling, feedback, escuta ativa e documentos que convencem.',
  icon: '💬',
  iconName: 'message-circle',
  accent: '#fb7185',
  accentLight: '#fda4af',
  mascotName: 'Vox',
  mascotGreeting: 'Bora destravar tua comunicação — falada e escrita.',
  slogans: {
    hero: 'Comunicar bem abre todas as portas',
    sub: 'Falar em público, conduzir reuniões, dar feedback, contar histórias e escrever documentos que respondem.',
    cta: 'Começar agora',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de comunicação…',
  },
});

const MARKETING_CONFIG = makeProfissionalBase({
  slug: 'marketing',
  name: 'Marketing Digital',
  shortLabel: 'Marketing',
  basePath: '/marketing',
  area: 'SEO · Branding · CAC/LTV · Funil · Copy',
  description:
    'Marketing digital com método: posicionamento, branding, SEO orgânico, copywriting, funil de aquisição e métricas que importam.',
  icon: '📣',
  iconName: 'megaphone',
  accent: '#ef4444',
  accentLight: '#fca5a5',
  mascotName: 'Mark',
  mascotGreeting: 'Marketing sem achismo. Bora?',
  slogans: {
    hero: 'Marketing com método, sem achismo',
    sub: 'Posicionamento, branding, SEO orgânico, copy, funil e métricas — para vender o próprio trabalho ou o de uma marca.',
    cta: 'Começar pelos fundamentos',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de marketing…',
  },
});

const CONTEUDO_CONFIG = makeProfissionalBase({
  slug: 'conteudo',
  name: 'Criação de Conteúdo',
  shortLabel: 'Conteúdo',
  basePath: '/conteudo',
  area: 'YouTube · LinkedIn · Instagram · Podcast · Edição · Monetização',
  description:
    'Estratégia editorial, gravação de áudio e vídeo, edição, publicação multi-plataforma, métricas e monetização — para qualquer profissional virar referência pública.',
  icon: '🎬',
  iconName: 'film',
  accent: '#ec4899',
  accentLight: '#f9a8d4',
  mascotName: 'Cliq',
  mascotGreeting: 'Bora construir audiência?',
  slogans: {
    hero: 'Construir audiência de verdade',
    sub: 'Da estratégia editorial à monetização: YouTube, LinkedIn, Instagram, podcast, edição e métricas.',
    cta: 'Começar a criar',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de conteúdo…',
  },
});

const EMPREENDEDORISMO_CONFIG = makeProfissionalBase({
  slug: 'empreendedorismo',
  name: 'Empreendedorismo Digital',
  shortLabel: 'Empreendedorismo',
  basePath: '/empreendedorismo',
  area: 'Produtos digitais · Infoprodutos · Freelance · SaaS · MEI',
  description:
    'Sair do CLT virando dono: validação de ideia, MVP, produtos digitais, infoprodutos, freelance, formalização, primeiras vendas e escala.',
  icon: '🚀',
  iconName: 'rocket',
  accent: '#eab308',
  accentLight: '#fde047',
  mascotName: 'Indie',
  mascotGreeting: 'Pronto pra parar de trabalhar pros outros?',
  slogans: {
    hero: 'Do CLT ao próprio negócio',
    sub: 'Validação, MVP, produtos digitais, freelance, infoprodutos, MEI e modelo de assinatura — passo a passo real.',
    cta: 'Começar a construir',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de empreendedorismo…',
  },
});

const VENDAS_CONFIG = makeProfissionalBase({
  slug: 'vendas',
  name: 'Vendas Consultivas & Negociação',
  shortLabel: 'Vendas',
  basePath: '/vendas',
  area: 'SPIN · Challenger · Sandler · MEDDIC · Chris Voss',
  description:
    'Vendas B2B modernas com método: SPIN de Neil Rackham (35.000 ligações analisadas), Challenger Sale de Dixon & Adamson, Sandler, MEDDIC/MEDDPICC para enterprise, e fechamento via tactical empathy de Chris Voss (24 anos como negociador-chefe de reféns do FBI). Para SDR, AE, founder vendendo, account manager e qualquer profissional que precisa fechar deal.',
  icon: '🎯',
  iconName: 'target',
  accent: '#0ea5e9',
  accentLight: '#7dd3fc',
  mascotName: 'Closer',
  mascotGreeting: 'Bora fechar deal de verdade — sem desconto que sangra a empresa?',
  slogans: {
    hero: 'Vendas como engenharia, não como sorte',
    sub: 'SPIN + Challenger + MEDDIC para discovery e qualificação. Chris Voss para fechar sem ceder margem.',
    cta: 'Começar pelo discovery',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de vendas…',
  },
});

const PSICOLOGIA_CONSUMO_CONFIG = makeProfissionalBase({
  slug: 'psicologia-do-consumo',
  name: 'Psicologia do Consumo',
  shortLabel: 'Psicologia',
  basePath: '/psicologia-do-consumo',
  area: 'Cialdini · Kahneman · Ariely · Thaler · Damasio · Byron Sharp · Christensen',
  description:
    'Por que humanos compram, desejam e cedem a atalhos mentais — com evidência. Os 7 Gatilhos de Cialdini (reciprocidade, compromisso, prova social, autoridade, afinidade, escassez, unidade) e Neuroeconomia da Decisão (System 1/2 de Kahneman, vieses de Ariely, nudge de Thaler, emoção sobre lógica de Damasio, How Brands Grow de Byron Sharp, Jobs-to-Be-Done de Christensen). Para persuadir eticamente em copy, landing, anúncio, pricing e vendas.',
  icon: '🧲',
  iconName: 'brain',
  accent: '#a855f7',
  accentLight: '#d8b4fe',
  mascotName: 'Psyche',
  mascotGreeting: 'Pronto pra entender por que humanos cedem antes de racionalizar?',
  slogans: {
    hero: 'Por que as pessoas compram — com ciência',
    sub: 'Cialdini, Kahneman, Ariely, Thaler — os 7 gatilhos e os vieses cognitivos aplicados a copy, landing e pricing.',
    cta: 'Começar pelo princípio 1',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de psicologia do consumo…',
  },
});

const CINEMA_CONFIG = makeProfissionalBase({
  slug: 'cinema',
  name: 'Cinematografia',
  shortLabel: 'Cinema',
  basePath: '/cinema',
  area: 'Linguagem · Roteiro · DP · Direção · Edição · Som · Produção',
  description:
    'Cinema com profundidade de conservatório, em PT-BR: linguagem cinematográfica, roteiro, storytelling visual, câmera & lente profissional, direção de fotografia, mise-en-scène, edição (Murch), som & trilha, produção e carreira de cineasta.',
  icon: '🎬',
  iconName: 'film',
  accent: '#ec4899',
  accentLight: '#f9a8d4',
  mascotName: 'Cine',
  mascotGreeting: 'Bora contar histórias que mexem com a alma?',
  slogans: {
    hero: 'Cinema com profundidade real',
    sub: 'Da gramática de Kuleshov ao log gamma da Venice 2 — pedagogia ancorada em AFI, USC e os mestres em atividade.',
    cta: 'Começar a filmar',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de cinema…',
  },
});

const INGLES_CONFIG = makeProfissionalBase({
  slug: 'ingles',
  name: 'Inglês',
  shortLabel: 'Inglês',
  basePath: '/ingles',
  area: 'Gramática · Vocabulário · 10 cenários do dia a dia',
  description:
    'Inglês para brasileiros que vão morar, trabalhar ou viajar no exterior: gramática essencial + 10 cenários reais com 100 trocas cada.',
  icon: '🌎',
  iconName: 'globe',
  accent: '#06b6d4',
  accentLight: '#67e8f9',
  mascotName: 'Talky',
  mascotGreeting: "Let's go — inglês de verdade, sem decoreba.",
  slogans: {
    hero: 'Inglês para brasileiros que vão pra gringa',
    sub: 'Gramática essencial + 10 cenários reais do dia a dia (aeroporto, moradia, trabalho, médico, banco, transporte e mais).',
    cta: 'Start learning',
  },
  microcopy: {
    moduleNoun: 'fase',
    trailNoun: 'jornada',
    searchPlaceholder: 'Buscar cenários e fases…',
  },
});

// ──────────────────────────────────────────────────────────────────────
// Registry — map slug → BaseConfig.
// Adicione novas bases aqui. Ordem importa para o "default" do app.
// ──────────────────────────────────────────────────────────────────────

export const BASE_REGISTRY: Record<string, BaseConfig> = {
  tecnologia: TECH_CONFIG,
  'medicina-veterinaria': MEDVET_CONFIG,
  neurociencia: NEUROCIENCIA_CONFIG,
  carreira: CARREIRA_CONFIG,
  comunicacao: COMUNICACAO_CONFIG,
  marketing: MARKETING_CONFIG,
  conteudo: CONTEUDO_CONFIG,
  empreendedorismo: EMPREENDEDORISMO_CONFIG,
  ingles: INGLES_CONFIG,
  cinema: CINEMA_CONFIG,
  vendas: VENDAS_CONFIG,
  'psicologia-do-consumo': PSICOLOGIA_CONSUMO_CONFIG,
};

export const DEFAULT_BASE_SLUG = 'tecnologia';

/** Lista todos os configs (útil pra dropdowns, perfil, admin). */
export function listBases(): BaseConfig[] {
  return Object.values(BASE_REGISTRY);
}

/** Lookup direto por slug. Retorna `undefined` se não existir. */
export function getBaseBySlug(slug: string): BaseConfig | undefined {
  return BASE_REGISTRY[slug];
}
