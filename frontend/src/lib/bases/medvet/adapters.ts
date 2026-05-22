/**
 * Adapters da base de Medicina Veterinária — convertem MEDVET_BASE para os
 * shapes compartilhados que o KnowledgeBaseHome consome (HubCardData,
 * ComecarPath). Permite que /medicina-veterinaria use exatamente os mesmos
 * componentes da /tecnologia, mudando só os dados e o tema.
 */

import { MEDVET_BASE } from './index';
import type { HubCardData } from '@/components/home/Explorar';
import type { ComecarPath } from '@/components/home/ComecarAqui';
import { MEDVET_THEME } from './theme';

const BASE_PATH = '/medicina-veterinaria';

export const MEDVET_TOTAL_MODULES = MEDVET_BASE.trails.reduce((acc, t) => acc + t.modules.length, 0);
export const MEDVET_TOTAL_TRAILS = MEDVET_BASE.trails.length;
export const MEDVET_TOTAL_HUBS = MEDVET_BASE.hubs?.length ?? 0;

const modBySlug = Object.fromEntries(
  MEDVET_BASE.trails.flatMap(t => t.modules.map(m => [m.slug, m] as const)),
);

export const MEDVET_HUBS: HubCardData[] =
  MEDVET_BASE.hubs?.map(hub => ({
    id: hub.slug,
    name: hub.name,
    icon: hub.icon,
    color: MEDVET_THEME.hubColors[hub.colorIndex],
    tagline: hub.description,
    href: `${BASE_PATH}/hub/${hub.slug}/`,
    trailCount: 1,
    moduleCount: hub.moduleSlugs.length,
  })) ?? [];

/**
 * "Por onde começar" — gera caminhos a partir dos hubs ou módulos.
 * Cada hub vira um path apontando pro primeiro módulo dele.
 */
export const MEDVET_PATHS: ComecarPath[] =
  MEDVET_BASE.hubs?.map(hub => {
    const firstSlug = hub.moduleSlugs[0];
    const mod = firstSlug ? modBySlug[firstSlug] : undefined;
    return {
      icon: hub.icon,
      title: hub.name,
      desc: hub.description,
      href: mod ? `${BASE_PATH}/${mod.slug}` : BASE_PATH,
      cta: mod ? `Começar pelo módulo ${String(mod.num).padStart(2, '0')}` : 'Explorar',
      color: MEDVET_THEME.hubColors[hub.colorIndex],
    };
  }) ?? [];
