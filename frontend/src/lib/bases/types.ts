// Tipos compartilhados pelas bases de conhecimento.
// Modelados pra que qualquer área (medvet, direito, design...) use o mesmo schema.

import type { BaseTheme } from './theme';

export type Section =
  | { kind: 'intro';    body: string }
  | { kind: 'concept';  title: string; body: string; metadata?: string }
  | { kind: 'example';  title: string; body: string; metadata?: string }
  | { kind: 'formula';  title: string; formula: string; explanation: string }
  | { kind: 'table';    caption?: string; headers: string[]; rows: string[][] }
  | { kind: 'summary';  title?: string; bullets: string[] }
  | { kind: 'callout';  tone: 'info' | 'warning' | 'highlight' | 'note'; title?: string; body: string };

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;       // index in options
  explanation: string;
  /**
   * Dica opcional — texto que aponta o conceito/caminho sem entregar a resposta.
   * Usuário pode clicar pra ver antes de marcar; não é mostrada automaticamente.
   */
  hint?: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface Module {
  slug: string;
  num: number;
  icon: string;
  title: string;
  summary: string;
  estimatedMin: number;
  keyTerms: KeyTerm[];
  sections: Section[];
  quiz: QuizQuestion[];
}

export interface Trail {
  slug: string;
  title: string;
  description: string;
  icon: string;
  modules: Module[];
}

/**
 * Hub temático — agrupa módulos por área de afinidade dentro de uma base.
 * Aponta pra moduleSlugs em vez de embutir módulos (os módulos vivem na trilha).
 */
export interface Hub {
  slug: string;
  name: string;
  icon: string;
  description: string;
  /** Índice da cor no array `theme.hubColors` (0-3). */
  colorIndex: 0 | 1 | 2 | 3;
  moduleSlugs: string[];
}

export interface Base {
  slug: string;
  name: string;
  area: string;
  description: string;
  icon: string;
  attribution: string;
  trails: Trail[];
  /** Hubs temáticos — se omitido, BaseIndex mostra só a lista de trilhas. */
  hubs?: Hub[];
}

// ────────────────────────────────────────────────────────────────────────
// BaseConfig — super-set de Base com tudo que a plataforma precisa pra
// renderizar uma base por completo: tema, microcopy, nav, footer, features.
//
// Cada base de conhecimento exporta um `BaseConfig`; o `BaseResolver` lê o
// pathname e devolve o config correto. Componentes downstream (header,
// drawer, footer, GameHUD) consomem do `BaseProvider` e nunca precisam
// saber em qual base estão.
// ────────────────────────────────────────────────────────────────────────

/** Microcopy contextualizada — varia entre bases (dev vs vet vs direito). */
export interface BaseMicrocopy {
  ctaPrimary: string;
  ctaSecondary: string;
  emptyState: string;
  searchPlaceholder: string;
  rankingTitle: string;
  /** Unidade de XP no header — "XP" / "ponto clínico" / "ponto OAB". */
  xpUnitSingular: string;
  xpUnitPlural: string;
  /** Como chamamos cada unidade — "módulo" / "caso" / "petição". */
  moduleNoun: string;
  trailNoun: string;
}

export interface BaseMascot {
  /** Emoji default (sempre suportado, sem CDN). */
  emoji: string;
  /** Imagem opcional — vence o emoji se presente. */
  imageUrl?: string;
  name: string;
  greeting: string;
}

export interface FooterLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface BaseFooterConfig {
  hubColumnTitle: string;
  hubLinks: FooterLinkItem[];
  contentColumnTitle: string;
  contentLinks: FooterLinkItem[];
  socialLinks?: FooterLinkItem[];
  /** 3-4 links mais importantes para o footer compacto mobile. */
  mobilePrimary: FooterLinkItem[];
  copyright?: string;
}

export interface BaseNavItem {
  href: string;
  label: string;
  color?: string;
  iconName?: string;
  lgOnly?: boolean;
  xlOnly?: boolean;
  isNew?: boolean;
}

export interface BaseNavConfig {
  hubNavItems: BaseNavItem[];
  /** Esconde itens GLOBAIS de conteúdo (News, /simulados de tech). */
  hideGlobalContentNav: boolean;
}

/** Toggles de funcionalidades por base. */
export interface BaseFeatures {
  /** 'global' = soma XP no perfil único; 'scoped' = XP separado por base; 'off' = sem gamificação. */
  gamification: 'global' | 'scoped' | 'off';
  srs: boolean;
  quizzes: boolean;
  community: boolean;
}

export interface BaseSimuladoLink {
  slug: string;
  title: string;
  href: string;
}

/**
 * BaseConfig — single source of truth de uma base de conhecimento.
 *
 * Sobre extension: estende `Base` em vez de duplicar — todo `BaseConfig`
 * continua sendo um `Base`, então adapters/consumidores antigos continuam
 * funcionando. Os campos novos são todos obrigatórios pra forçar cada base
 * a se posicionar de verdade (sem "configurar depois").
 */
export interface BaseConfig extends Base {
  /** Prefixo de rota da base, ex.: "/medicina-veterinaria". */
  basePath: string;
  status: 'live' | 'queued' | 'in_production';
  theme: BaseTheme;
  mascot: BaseMascot;
  microcopy: BaseMicrocopy;
  slogans: { hero: string; sub: string; cta: string };
  nav: BaseNavConfig;
  footer: BaseFooterConfig;
  simulados?: BaseSimuladoLink[];
  features: BaseFeatures;
}
