/**
 * BaseResolver — converte pathname em BaseConfig.
 *
 * O `AppChrome` chama `resolveBaseConfig(pathname)` pra hidratar o
 * `BaseProvider`. Componentes downstream nunca precisam saber em qual base
 * estão — usam `useBaseConfig()`.
 *
 * Regra: o prefixo da rota é o slug da base. Ex.:
 *   /tecnologia                 → tecnologia
 *   /medicina-veterinaria/foo   → medicina-veterinaria
 *   /ia                         → tecnologia (subrota tech)
 *   /aprenda/<slug>             → tecnologia (módulos tech vivem aqui)
 *   /simulados/<slug>           → tecnologia
 *
 * Rotas globais que não pertencem a uma base específica (`/`, `/sobre`,
 * `/comunidade`, `/bases`, `/newsletter`) retornam null — chamador decide
 * o chrome (LandingHeader/Footer).
 */

import { BASE_REGISTRY, DEFAULT_BASE_SLUG } from './registry';
import { getBaseSlugForModule } from './module-base-resolver';
import type { BaseConfig } from './types';

const MARKETING_PATHS = new Set([
  '/',
  '/sobre',
  '/comunidade',
  '/newsletter',
  '/bases',
  '/stats-publicas',
]);

/** Rotas que pertencem ao chrome de app mas não a uma base específica. */
const APP_GLOBAL_PREFIXES = [
  '/progresso',
  '/ranking',
  '/revisar',
  '/preferencias',
  '/perfil',
  '/meu-aprendizado',
  '/diff-de-conhecimento',
  '/trilhas-espelho',
  '/news',
  '/search',
  '/explorar',
  '/glossario',
  '/playlists',
  '/roadmaps',
  '/mapa',
  '/cheatsheets',
  '/verificar',
  '/admin',
];

export interface ResolvedRoute {
  /** Config da base, ou null se for rota marketing/global sem base. */
  base: BaseConfig | null;
  /** True se for rota marketing (landing chrome). */
  isMarketing: boolean;
  /** True se for rota global de app (não pertence a base, mas usa app chrome). */
  isAppGlobal: boolean;
}

function normalize(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

/**
 * Retorna o slug da base se o pathname começar com o `basePath` de alguma base.
 * Inclui as rotas legadas tech (`/aprenda`, `/simulados`, `/ia`, etc.).
 */
function detectBaseSlug(pathname: string): string | null {
  const trimmed = normalize(pathname);

  for (const cfg of Object.values(BASE_REGISTRY)) {
    if (trimmed === cfg.basePath || trimmed.startsWith(cfg.basePath + '/')) {
      return cfg.slug;
    }
  }

  // Rota de módulo: /aprenda/<slug> resolve para a base do módulo. Cada
  // módulo pertence a uma trilha, cada trilha a um hub, cada hub a uma base.
  // Vide module-base-resolver.ts — fonte de verdade do mapeamento.
  // Sem isso, módulos de Comunicação/Marketing/etc. herdavam o chrome de
  // /tecnologia (bug reportado pelo PO: chrome vazando entre bases).
  if (trimmed.startsWith('/aprenda/')) {
    const slug = trimmed.slice('/aprenda/'.length).split('/')[0];
    const baseFromModule = getBaseSlugForModule(slug);
    if (baseFromModule) return baseFromModule;
    return 'tecnologia';
  }

  // Rotas legadas tech — convivem fora de /tecnologia mas pertencem à base.
  // /aprenda fica DE FORA aqui porque o slug do módulo determina a base
  // (tratado acima). Mantemos /aprenda como root para fallback se o módulo
  // for desconhecido.
  const TECH_LEGACY = ['/aprenda', '/simulados', '/ia', '/aws', '/engenharia', '/claude-anthropic',
    '/fundamentos', '/programacao', '/dados', '/construcao', '/seguranca-hardware-hacking'];
  if (TECH_LEGACY.some(p => trimmed === p || trimmed.startsWith(p + '/'))) {
    return 'tecnologia';
  }

  return null;
}

export function resolveBaseConfig(pathname: string): ResolvedRoute {
  const trimmed = normalize(pathname);

  if (MARKETING_PATHS.has(trimmed)) {
    return { base: null, isMarketing: true, isAppGlobal: false };
  }

  const slug = detectBaseSlug(trimmed);
  if (slug) {
    return {
      base: BASE_REGISTRY[slug] ?? null,
      isMarketing: false,
      isAppGlobal: false,
    };
  }

  // Rotas de app sem base própria — usam o default (tech) pro chrome,
  // mas marcadas como global pra componentes que queiram ignorar microcopy.
  if (APP_GLOBAL_PREFIXES.some(p => trimmed === p || trimmed.startsWith(p + '/'))) {
    return {
      base: BASE_REGISTRY[DEFAULT_BASE_SLUG] ?? null,
      isMarketing: false,
      isAppGlobal: true,
    };
  }

  // Fallback: trate como tech-default.
  return {
    base: BASE_REGISTRY[DEFAULT_BASE_SLUG] ?? null,
    isMarketing: false,
    isAppGlobal: true,
  };
}
