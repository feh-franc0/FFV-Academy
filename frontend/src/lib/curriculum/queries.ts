export { getLevelInfo, getTrailProgress, getHubBySlug, getHubForTrail, getHubTrailsLeve } from './queries-leves';

import type { Hub, Module, Trail } from './types';
import { CURRICULUM } from './trails';
import { temConteudo } from '../content-availability';

/* ──────────────────────────────────────────────
   HUBS — temáticas editoriais que agrupam trilhas
   (`getHubBySlug`/`getHubForTrail` moraram aqui até 11/ago/2026 — mudaram
   para `queries-leves.ts` porque não usam `CURRICULUM`, e reexportam acima)
──────────────────────────────────────────────── */

export function getTrailHref(trailId: string): string {
  return CURRICULUM.find(t => t.id === trailId)?.href ?? '/';
}

/**
 * Busca a trilha pela própria rota em que a página vive.
 *
 * Existe para matar uma classe de bug: 16 páginas de trilha indexavam o array
 * por POSIÇÃO (`CURRICULUM[9]`). Quando o pivot de jul/2026 removeu 49 trilhas,
 * os índices deslizaram e **11 dessas páginas passaram a renderizar a trilha
 * errada sob o título certo** — `/observabilidade-sre` exibindo "Claude Code do
 * zero ao poder total", `/sql-databases` exibindo "Claude Code Pro", e assim por
 * diante. Nada quebrava: a página abria, com 200, com o conteúdo de outra coisa.
 *
 * Buscar por `href` amarra a página ao dado em vez de à ordem do array. Se a
 * trilha for removida, devolve `undefined` e a página pode chamar `notFound()`
 * em vez de mostrar conteúdo alheio.
 */
export function getTrailByHref(href: string): Trail | undefined {
  const alvo = href.replace(/\/$/, '');
  return CURRICULUM.find(t => (t.href ?? '').replace(/\/$/, '') === alvo);
}

export function getHubTrails(hub: Hub): Trail[] {
  return hub.trailIds
    .map(id => CURRICULUM.find(t => t.id === id))
    .filter((t): t is Trail => !!t);
}

export function getHubStats(hub: Hub, completedSlugs: string[] = []) {
  const trails = getHubTrails(hub);
  const modules = trails.flatMap(t => t.modules);
  const totalXp = modules.reduce((acc, m) => acc + m.xp, 0);
  const done = modules.filter(m => completedSlugs.includes(m.slug)).length;
  const minutes = modules.reduce((acc, m) => acc + m.readTime, 0);
  return {
    trailCount: trails.length,
    moduleCount: modules.length,
    totalXp,
    minutes,
    done,
    pct: modules.length === 0 ? 0 : Math.round((done / modules.length) * 100),
  };
}

/* ──────────────────────────────────────────────
   LOOKUP HELPERS — busca por slug em todo o currículo
──────────────────────────────────────────────── */

const _moduleMap = new Map<string, { module: Module; trail: Trail }>();
function ensureModuleMap() {
  if (_moduleMap.size > 0) return;
  for (const trail of CURRICULUM) {
    for (const mod of trail.modules) {
      _moduleMap.set(mod.slug, { module: mod, trail });
    }
  }
}

export function getModuleBySlug(slug: string): Module | undefined {
  ensureModuleMap();
  return _moduleMap.get(slug)?.module;
}

export function getTrailForModule(slug: string): Trail | undefined {
  ensureModuleMap();
  return _moduleMap.get(slug)?.trail;
}

export interface PrereqInfo {
  module: Module;
  trail: Trail;
  completed: boolean;
}

export function getModulePrerequisites(slug: string, completedSlugs: string[]): PrereqInfo[] {
  const mod = getModuleBySlug(slug);
  if (!mod?.prerequisites?.length) return [];
  return mod.prerequisites
    .map(ps => {
      ensureModuleMap();
      const entry = _moduleMap.get(ps);
      if (!entry) return null;
      // módulo declarado mas sem conteúdo escrito → /aprenda/<slug> dá 404.
      // Não faz sentido exigir como pré-requisito algo que não existe para ler.
      if (!temConteudo(ps)) return null;
      return { module: entry.module, trail: entry.trail, completed: completedSlugs.includes(ps) };
    })
    .filter((p): p is PrereqInfo => p !== null);
}

export interface NextStepInfo {
  module: Module;
  trail: Trail;
}

export function getModuleNextSteps(slug: string): NextStepInfo[] {
  const mod = getModuleBySlug(slug);
  if (!mod?.nextSuggested?.length) return [];
  return mod.nextSuggested
    .map(ns => {
      ensureModuleMap();
      const entry = _moduleMap.get(ns);
      if (!entry) return null;
      // não sugerir "próximo passo" que responde 404 — era o beco sem saída de
      // quem terminava um módulo e clicava adiante
      if (!temConteudo(ns)) return null;
      return { module: entry.module, trail: entry.trail };
    })
    .filter((n): n is NextStepInfo => n !== null);
}
