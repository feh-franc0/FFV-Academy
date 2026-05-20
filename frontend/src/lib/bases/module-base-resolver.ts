/**
 * Module → Base resolver
 *
 * Pra cada slug de módulo, descobre a qual base ele pertence. Permite filtrar
 * `state.completedModules`, `state.reviewCards`, `state.lastArticle` etc. por
 * base ativa, sem precisar mudar o schema do GameState (que é flat hoje).
 *
 * O mapa é construído UMA VEZ na importação — iterando o CURRICULUM (tech)
 * e o MEDVET_BASE. Quando uma base nova for adicionada, basta importar aqui
 * e ela entra no mapa automaticamente.
 *
 * Limites conhecidos:
 * - Slugs duplicados entre bases: o mais tarde registrado vence. Os testes
 *   garantem que isso nunca acontece (cada base tem namespace próprio).
 * - Slugs desconhecidos retornam null — chamador decide o que fazer (esconder?
 *   atribuir ao default? mostrar mesmo assim?).
 */

import { CURRICULUM } from '@/lib/curriculum';
import { MEDVET_MODULE_SLUGS } from '@/lib/bases/medvet/slugs';
import { DEFAULT_BASE_SLUG } from './registry';

const moduleToBase = new Map<string, string>();
const baseToModules = new Map<string, Set<string>>();

function register(moduleSlug: string, baseSlug: string): void {
  moduleToBase.set(moduleSlug, baseSlug);
  const set = baseToModules.get(baseSlug) ?? new Set<string>();
  set.add(moduleSlug);
  baseToModules.set(baseSlug, set);
}

// Tech — CURRICULUM global (já está no bundle por outros lugares).
for (const trail of CURRICULUM) {
  for (const m of trail.modules) {
    register(m.slug, 'tecnologia');
  }
}

// Medvet — só slugs (não importa conteúdo pesado dos 12 módulos).
for (const slug of MEDVET_MODULE_SLUGS) {
  register(slug, 'medicina-veterinaria');
}

/**
 * Retorna o slug da base que um módulo pertence, ou null se desconhecido.
 */
export function getBaseSlugForModule(moduleSlug: string | null | undefined): string | null {
  if (!moduleSlug) return null;
  return moduleToBase.get(moduleSlug) ?? null;
}

/**
 * Conjunto de slugs de módulos de uma base. Útil pra filtrar arrays grandes
 * em O(1) por elemento (em vez de O(n) por verificação).
 */
export function getModuleSlugSetForBase(baseSlug: string): Set<string> {
  return baseToModules.get(baseSlug) ?? new Set<string>();
}

/**
 * Filtra um array de slugs deixando só os que pertencem à base. Modules
 * desconhecidos (sem base mapeada) são tratados como pertencentes ao DEFAULT
 * (tech) — isso evita esconder progresso antigo de usuários que estavam só em
 * tech antes desta lógica existir.
 */
export function filterSlugsByBase(slugs: string[], baseSlug: string): string[] {
  const allowed = getModuleSlugSetForBase(baseSlug);
  const isDefault = baseSlug === DEFAULT_BASE_SLUG;
  return slugs.filter(s => {
    if (allowed.has(s)) return true;
    if (isDefault && !moduleToBase.has(s)) return true;
    return false;
  });
}

/**
 * Diagnóstico — pra testes e telemetria.
 */
export function getModuleBaseStats(): { totalMapped: number; perBase: Record<string, number> } {
  const perBase: Record<string, number> = {};
  for (const [baseSlug, set] of baseToModules.entries()) {
    perBase[baseSlug] = set.size;
  }
  return { totalMapped: moduleToBase.size, perBase };
}
