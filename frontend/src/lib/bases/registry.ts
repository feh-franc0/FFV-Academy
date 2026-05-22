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
    rankingTitle: 'Top devs da semana',
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
      { label: 'Ranking', href: '/ranking' },
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
    rankingTitle: 'Top vets da semana',
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
    rankingTitle: string;
  };
}

function makeProfissionalBase(seed: ProfissionalBaseSeed): BaseConfig {
  const navItem: FooterLinkItem = { label: seed.shortLabel, href: seed.basePath };
  const ownContent: FooterLinkItem[] = [
    { label: 'Progresso', href: '/progresso' },
    { label: 'Revisar (SRS)', href: '/revisar' },
    { label: 'Ranking', href: '/ranking' },
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
      rankingTitle: seed.microcopy.rankingTitle,
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
        { label: 'Ranking', href: '/ranking' },
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
  area: 'Portfólio · Vagas · Interview · Promoção',
  description:
    'Carreira como sistema: portfólio, vagas BR e gringa, behavioral interview, negotiation, promo docs.',
  icon: '🎯',
  iconName: 'target',
  accent: '#f472b6',
  accentLight: '#f9a8d4',
  mascotName: 'Ana',
  mascotGreeting: 'Oi! Bora dirigir a tua carreira em vez de torcer pela sorte?',
  slogans: {
    hero: 'Carreira como sistema, não como sorte',
    sub: 'Portfólio, busca de vagas, interview e promoção — passo a passo de quem chega em staff.',
    cta: 'Começar pela base da carreira',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de carreira…',
    rankingTitle: 'Top de Carreira da semana',
  },
});

const COMUNICACAO_CONFIG = makeProfissionalBase({
  slug: 'comunicacao',
  name: 'Comunicação',
  shortLabel: 'Comunicação',
  basePath: '/comunicacao',
  area: 'Falar em público · Technical Writing · RFCs',
  description:
    'Comunicação humana e escrita técnica que multiplica engenheiros — RFCs, ADRs, postmortems, public speaking.',
  icon: '💬',
  iconName: 'message-circle',
  accent: '#fb7185',
  accentLight: '#fda4af',
  mascotName: 'Vox',
  mascotGreeting: 'Bora destravar tua comunicação — falada e escrita.',
  slogans: {
    hero: 'Comunicar bem multiplica engenheiros',
    sub: 'Falar em público, technical writing, RFCs, design docs e postmortems blameless — templates reais.',
    cta: 'Começar agora',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de comunicação…',
    rankingTitle: 'Top de Comunicação da semana',
  },
});

const MARKETING_CONFIG = makeProfissionalBase({
  slug: 'marketing',
  name: 'Marketing Digital',
  shortLabel: 'Marketing',
  basePath: '/marketing',
  area: 'SEO · Branding · CAC/LTV · Funil',
  description:
    'Marketing como engenharia: posicionamento, SEO técnico, métricas (CAC, LTV) e funil ponta-a-ponta.',
  icon: '📣',
  iconName: 'megaphone',
  accent: '#ef4444',
  accentLight: '#fca5a5',
  mascotName: 'Mark',
  mascotGreeting: 'Marketing sem achismo. Bora?',
  slogans: {
    hero: 'Marketing como engenharia, não como achismo',
    sub: 'Posicionamento, SEO técnico, CAC/LTV, funil. Para devs que querem vender o próprio trabalho.',
    cta: 'Começar pelos fundamentos',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de marketing…',
    rankingTitle: 'Top de Marketing da semana',
  },
});

const CONTEUDO_CONFIG = makeProfissionalBase({
  slug: 'conteudo',
  name: 'Criação de Conteúdo',
  shortLabel: 'Conteúdo',
  basePath: '/conteudo',
  area: 'YouTube · LinkedIn · Gravação · Monetização',
  description:
    'Estratégia, gravação áudio+vídeo, edição, publicação multi-plataforma, métricas e monetização.',
  icon: '🎬',
  iconName: 'film',
  accent: '#ec4899',
  accentLight: '#f9a8d4',
  mascotName: 'Cliq',
  mascotGreeting: 'Bora construir audiência como engineer?',
  slogans: {
    hero: 'Construir audiência como engineer',
    sub: 'Da estratégia editorial à monetização: YouTube, LinkedIn, gravação, edição, publicação.',
    cta: 'Começar a criar',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de conteúdo…',
    rankingTitle: 'Top Criadores da semana',
  },
});

const EMPREENDEDORISMO_CONFIG = makeProfissionalBase({
  slug: 'empreendedorismo',
  name: 'Empreendedorismo Digital',
  shortLabel: 'Empreendedorismo',
  basePath: '/empreendedorismo',
  area: 'Solo SaaS · Indie Hacker · MVP · Freelance',
  description:
    'Sair do CLT virando founder. Validação, MVP, Solo SaaS, Stripe billing, multi-tenancy, CAC/LTV.',
  icon: '🚀',
  iconName: 'rocket',
  accent: '#eab308',
  accentLight: '#fde047',
  mascotName: 'Indie',
  mascotGreeting: 'Pronto pra parar de trabalhar pros outros?',
  slogans: {
    hero: 'Do CLT ao founder solo',
    sub: 'Indie hacker stack, Solo SaaS, validação, MVP, Stripe billing — passo a passo real.',
    cta: 'Começar a construir',
  },
  microcopy: {
    moduleNoun: 'módulo',
    trailNoun: 'trilha',
    searchPlaceholder: 'Buscar tópicos de empreendedorismo…',
    rankingTitle: 'Top Founders da semana',
  },
});

const INGLES_CONFIG = makeProfissionalBase({
  slug: 'ingles',
  name: 'Inglês',
  shortLabel: 'Inglês',
  basePath: '/ingles',
  area: 'Gramática · 10 cenários reais · Trabalho na gringa',
  description:
    'Inglês para brasileiros que vão trabalhar com a gringa: gramática essencial + 10 cenários reais com 100 trocas cada.',
  icon: '🌎',
  iconName: 'globe',
  accent: '#06b6d4',
  accentLight: '#67e8f9',
  mascotName: 'Talky',
  mascotGreeting: "Let's go — inglês de verdade, sem decoreba.",
  slogans: {
    hero: 'Inglês para brasileiros que vão pra gringa',
    sub: 'Gramática essencial + 10 cenários reais (entrevista, daily, code review, negociação).',
    cta: 'Start learning',
  },
  microcopy: {
    moduleNoun: 'fase',
    trailNoun: 'jornada',
    searchPlaceholder: 'Buscar cenários e fases…',
    rankingTitle: 'Top da semana em Inglês',
  },
});

// ──────────────────────────────────────────────────────────────────────
// Registry — map slug → BaseConfig.
// Adicione novas bases aqui. Ordem importa para o "default" do app.
// ──────────────────────────────────────────────────────────────────────

export const BASE_REGISTRY: Record<string, BaseConfig> = {
  tecnologia: TECH_CONFIG,
  'medicina-veterinaria': MEDVET_CONFIG,
  carreira: CARREIRA_CONFIG,
  comunicacao: COMUNICACAO_CONFIG,
  marketing: MARKETING_CONFIG,
  conteudo: CONTEUDO_CONFIG,
  empreendedorismo: EMPREENDEDORISMO_CONFIG,
  ingles: INGLES_CONFIG,
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
