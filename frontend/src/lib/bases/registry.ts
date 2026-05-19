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
// Registry — map slug → BaseConfig.
// Adicione novas bases aqui. Ordem importa para o "default" do app.
// ──────────────────────────────────────────────────────────────────────

export const BASE_REGISTRY: Record<string, BaseConfig> = {
  tecnologia: TECH_CONFIG,
  'medicina-veterinaria': MEDVET_CONFIG,
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
