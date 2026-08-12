import { LEVELS } from './levels';
import { HUBS } from './hubs';
import { CURRICULO_LEVE, type TrilhaLeve } from './indice-leve';
import type { Hub } from './types';

/**
 * Consultas que NÃO dependem do currículo completo.
 *
 * Elas moram num arquivo separado por um motivo medido: `useGameState` usa as
 * duas, vive no layout raiz (via SyncBanner) e, enquanto as importava de
 * `queries.ts`, arrastava `CURRICULUM` junto — porque aquele arquivo importa
 * as 39 trilhas para as outras consultas. Resultado: 224 KB de currículo no
 * primeiro carregamento das 95 rotas, incluindo `/verificar` e `/sobre`.
 *
 * A regra para acrescentar algo aqui: se a função precisar de `CURRICULUM`,
 * ela pertence a `queries.ts`. Uma única importação errada aqui desfaz a
 * separação inteira, em silêncio — `layout-sem-curriculo.test.ts` trava isso.
 */

export function getLevelInfo(xp: number) {
  return LEVELS.find(l => xp >= l.xpMin && xp < l.xpMax) ?? LEVELS[LEVELS.length - 1];
}

/**
 * `getHubBySlug` e `getHubForTrail` moraram em `queries.ts` até 11/ago/2026,
 * mas nenhuma das duas usa `CURRICULUM` — só `HUBS`, que é leve (5 hubs, sem
 * módulo). Ficavam no arquivo errado por proximidade, não por dependência, e
 * qualquer componente de CLIENTE que precisasse só de "qual hub é este" pagava
 * pelo currículo inteiro ao importar do mesmo arquivo. `queries.ts` reexporta
 * as duas por compatibilidade — 84 arquivos importam do barril.
 */
export function getHubBySlug(slug: string): Hub | undefined {
  return HUBS.find(h => h.slug === slug);
}

export function getHubForTrail(trailId: string): Hub | undefined {
  return HUBS.find(h => h.trailIds.includes(trailId));
}

/**
 * Equivalente LEVE de `getHubTrails` — devolve `TrilhaLeve[]` (sem
 * `desc`/`keywords`) em vez de `Trail[]`. Existe para componentes de cliente
 * que só precisam de slug/title/icon/xp/readTime por módulo (recomendação,
 * progresso, contadores) — `ContinueCard` e `TrilhaDoDia`, ambos na home.
 */
export function getHubTrailsLeve(hub: Hub): TrilhaLeve[] {
  return hub.trailIds
    .map(id => CURRICULO_LEVE.find(t => t.id === id))
    .filter((t): t is TrilhaLeve => !!t);
}

/**
 * Equivalente LEVE de `getHubStats` — mesmo cálculo (trilhas, módulos, XP,
 * minutos, % concluído), só que a partir de `CURRICULO_LEVE`. Nenhum dos
 * números usa `desc`/`keywords`.
 */
export function getHubStatsLeve(hub: Hub, completedSlugs: string[] = []) {
  const trails = getHubTrailsLeve(hub);
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

/**
 * Trilhas 100% concluídas — usado pela seção de certificados de /progresso.
 * Só precisa de id/color/icon/modules[].slug, que `CURRICULO_LEVE` carrega.
 * Vivia como `getCompletedTrailIds` em `components/Certificate.tsx` (devolvendo
 * `Trail[]`, com `desc`/`keywords` inteiros) — mas era chamada de forma
 * SÍNCRONA em `/progresso`, então mover `Certificate` (que gera o PNG) para
 * `next/dynamic` não bastava: esta consulta específica não podia ir junto.
 */
export function getTrilhasConcluidasLeve(completedModules: string[]): TrilhaLeve[] {
  return CURRICULO_LEVE.filter(t => t.modules.every(m => completedModules.includes(m.slug)));
}

/**
 * Progresso de uma trilha.
 *
 * O parâmetro aceita qualquer coisa com `slug` — e não `Module[]` — porque é
 * literalmente tudo o que a função usa. Exigir o tipo completo obrigava quem
 * chama a carregar `desc` e `keywords` só para contar quantos slugs estão numa
 * lista, e era isso que impedia o índice leve de ser usado aqui.
 */
export function getTrailProgress(trailModules: { slug: string }[], completedModules: string[]) {
  const done = trailModules.filter(m => completedModules.includes(m.slug)).length;
  return { done, total: trailModules.length, pct: Math.round((done / trailModules.length) * 100) };
}
