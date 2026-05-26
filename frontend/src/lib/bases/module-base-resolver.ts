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

import { CURRICULUM, HUBS } from '@/lib/curriculum';
import { MEDVET_MODULE_SLUGS } from '@/lib/bases/medvet/slugs';
import { NEUROCIENCIA_MODULE_SLUGS } from '@/lib/bases/neurociencia/slugs';
import { DEFAULT_BASE_SLUG } from './registry';

const moduleToBase = new Map<string, string>();
const baseToModules = new Map<string, Set<string>>();
/**
 * trail.href → base slug. Permite o resolver descobrir qual base é dona
 * de URLs de trilha como /carreira-digital, /technical-writing, /solo-saas
 * — sem essa tabela, essas URLs caíam em 'tecnologia' por default e o
 * chrome ficava errado.
 */
const trailHrefToBase = new Map<string, string>();

function register(moduleSlug: string, baseSlug: string): void {
  moduleToBase.set(moduleSlug, baseSlug);
  const set = baseToModules.get(baseSlug) ?? new Set<string>();
  set.add(moduleSlug);
  baseToModules.set(baseSlug, set);
}

// Mapeamento hub slug → base slug. Slugs dos hubs da família Profissional
// Digital (carreira, comunicacao, marketing, conteudo, empreendedorismo,
// ingles) coincidem com os slugs das bases — cada um é uma base própria.
// Os demais hubs (ia, aws, engenharia, claude-anthropic, fundamentos,
// programacao, dados, construcao, seguranca-hardware-hacking) pertencem
// à base 'tecnologia'.
const PROFISSIONAL_BASE_SLUGS = new Set([
  'carreira', 'comunicacao', 'marketing', 'conteudo',
  'empreendedorismo', 'ingles',
]);

function baseSlugForHub(hubSlug: string): string {
  return PROFISSIONAL_BASE_SLUGS.has(hubSlug) ? hubSlug : 'tecnologia';
}

// Constrói trailId → baseSlug a partir do HUBS array. Cada trilha aparece
// em exatamente UM hub; o hub determina a base.
const trailToBase = new Map<string, string>();
for (const hub of HUBS) {
  const base = baseSlugForHub(hub.slug);
  for (const trailId of hub.trailIds) {
    trailToBase.set(trailId, base);
  }
}

// Itera CURRICULUM e registra cada módulo na base correspondente do hub
// da sua trilha. Trilhas sem hub (raro, mas possível durante refatorações)
// caem em 'tecnologia' como default. Aproveita pra registrar também
// trail.href → base no trailHrefToBase (usado pelo resolver de rota).
for (const trail of CURRICULUM) {
  const base = trailToBase.get(trail.id) ?? 'tecnologia';
  if (trail.href && !trailHrefToBase.has(trail.href)) {
    trailHrefToBase.set(trail.href, base);
  }
  for (const m of trail.modules) {
    register(m.slug, base);
  }
}

// Medvet — só slugs (não importa conteúdo pesado dos 12 módulos).
for (const slug of MEDVET_MODULE_SLUGS) {
  register(slug, 'medicina-veterinaria');
}

// Neurociência — 8 módulos da trilha Neuromarketing.
for (const slug of NEUROCIENCIA_MODULE_SLUGS) {
  register(slug, 'neurociencia');
}

/**
 * Retorna o slug da base que um módulo pertence, ou null se desconhecido.
 */
export function getBaseSlugForModule(moduleSlug: string | null | undefined): string | null {
  if (!moduleSlug) return null;
  return moduleToBase.get(moduleSlug) ?? null;
}

/**
 * Retorna o slug da base dona de um href de trilha (ex.: '/carreira-digital'
 * → 'carreira'). Usado pelo resolver para que URLs de trilha legadas
 * renderizem o chrome da base correta, e não o default 'tecnologia'.
 */
export function getBaseSlugForTrailHref(href: string | null | undefined): string | null {
  if (!href) return null;
  return trailHrefToBase.get(href) ?? null;
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
