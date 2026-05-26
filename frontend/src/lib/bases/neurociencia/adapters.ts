/**
 * Adapters da base de Neurociência — convertem NEUROCIENCIA_BASE pros shapes
 * que o KnowledgeBaseHome consome (HubCardData, ComecarPath). Permite que
 * /neurociencia use exatamente os mesmos componentes da /tecnologia e
 * /medicina-veterinaria, variando só dados e tema.
 */

import { NEUROCIENCIA_BASE } from './index';
import type { HubCardData } from '@/components/home/Explorar';
import type { ComecarPath } from '@/components/home/ComecarAqui';
import { NEUROCIENCIA_THEME } from './theme';

const BASE_PATH = '/neurociencia';

export const NEUROCIENCIA_TOTAL_MODULES = NEUROCIENCIA_BASE.trails.reduce(
  (acc, t) => acc + t.modules.length,
  0,
);
export const NEUROCIENCIA_TOTAL_TRAILS = NEUROCIENCIA_BASE.trails.length;
export const NEUROCIENCIA_TOTAL_HUBS = NEUROCIENCIA_BASE.hubs?.length ?? 0;

const modBySlug = Object.fromEntries(
  NEUROCIENCIA_BASE.trails.flatMap(t => t.modules.map(m => [m.slug, m] as const)),
);

export const NEUROCIENCIA_HUBS: HubCardData[] =
  NEUROCIENCIA_BASE.hubs?.map(hub => ({
    id: hub.slug,
    name: hub.name,
    icon: hub.icon,
    color: NEUROCIENCIA_THEME.hubColors[hub.colorIndex],
    tagline: hub.description,
    href: `${BASE_PATH}/hub/${hub.slug}/`,
    trailCount: 1,
    moduleCount: hub.moduleSlugs.length,
  })) ?? [];

/**
 * "Por onde começar" — cada hub vira um path apontando pro primeiro
 * módulo dele. Texto do CTA inclui o num do módulo zero-padded pra ficar
 * coerente com o resto da plataforma.
 */
export const NEUROCIENCIA_PATHS: ComecarPath[] =
  NEUROCIENCIA_BASE.hubs?.map(hub => {
    const firstSlug = hub.moduleSlugs[0];
    const mod = firstSlug ? modBySlug[firstSlug] : undefined;
    return {
      icon: hub.icon,
      title: hub.name,
      desc: hub.description,
      href: mod ? `${BASE_PATH}/${mod.slug}` : BASE_PATH,
      cta: mod ? `Começar pelo módulo ${String(mod.num).padStart(2, '0')}` : 'Explorar',
      color: NEUROCIENCIA_THEME.hubColors[hub.colorIndex],
    };
  }) ?? [];
