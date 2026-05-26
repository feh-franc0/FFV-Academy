/**
 * `getAllModulesForBase(slug)` — universo de módulos da base ativa.
 *
 * Antes desta refatoração, `ContinueCard.allPosts()` e `getDailyModule()`
 * liam APENAS o `CURRICULUM` global (que é só tech). Resultado: usuário em
 * medvet via "Fundamentos da IA" sugerido como módulo do dia ou como
 * "Recomendado para começar". Bug visível ao usuário em 2026-05-21.
 *
 * Agora cada base sabe declarar seu universo de módulos via este resolver.
 * Tech pesca do CURRICULUM (5000 linhas TS). Medvet pesca do MEDVET_BASE
 * (12 módulos). Bases queued retornam [] — DailyModule/ContinueCard sumem
 * graciosamente até a base ter conteúdo.
 *
 * Próxima fase (Fase 4): módulos vivem em Postgres. Este helper vira o
 * cliente do endpoint `/api/v1/curriculum?base=<slug>` e o catálogo fica
 * dinâmico sem deploy de código.
 */

import { CURRICULUM, type Module as TechModule } from '@/lib/curriculum';
import { MEDVET_BASE } from '@/lib/bases/medvet';
import { NEUROCIENCIA_BASE } from '@/lib/bases/neurociencia';
import { DEFAULT_BASE_SLUG } from './registry';

/**
 * Shape mínimo comum para ContinueCard, DailyModule, Trending.
 * NÃO é o `Module` completo nem do tech nem do medvet — é um lowest common
 * denominator que cobre o que os componentes precisam pra renderizar.
 */
export interface BaseModuleSummary {
  slug: string;
  title: string;
  icon: string;
  /** Minutos de leitura estimados. */
  readTime: number;
  /** XP de recompensa. Medvet hoje não tem XP por módulo — vira 0. */
  xp: number;
  /** Nome da trilha em que o módulo está. */
  trailName: string;
  /** Cor da trilha — hex. */
  trailColor: string;
  /** Slug da trilha (útil pra agrupar). */
  trailSlug: string;
  /** Nível ou null se a base não tiver níveis. */
  level: 'foundational' | 'beginner' | 'intermediate' | 'advanced' | null;
  /** URL clicável do módulo, considerando a base (sem trailing slash). */
  href: string;
}

function mapTechModule(t: typeof CURRICULUM[number], m: TechModule): BaseModuleSummary {
  return {
    slug: m.slug,
    title: m.title,
    icon: m.icon,
    readTime: m.readTime,
    xp: m.xp,
    trailName: t.name,
    trailColor: t.color,
    trailSlug: t.id,
    level: m.level ?? null,
    href: `/aprenda/${m.slug}`,
  };
}

function mapMedvetModule(): BaseModuleSummary[] {
  // Itera por TODAS as trilhas — antes pegava só trails[0] (Genética),
  // ignorando "Métodos de Seleção e Testes" e qualquer trilha futura.
  return MEDVET_BASE.trails.flatMap(trail =>
    trail.modules.map(m => ({
      slug: m.slug,
      title: m.title,
      icon: m.icon,
      // Medvet usa estimatedMin em vez de readTime; XP ainda não foi atribuído
      // (decisão pedagógica pendente). Tratamos como leitura sem reward.
      readTime: m.estimatedMin,
      xp: 0,
      trailName: trail.title,
      // Cor da trilha medvet: usamos accent do tema (sage). Hardcoded aqui
      // pra não importar o tema (ciclo de imports). Quando medvet ganhar
      // trail.color, troca pra t.color.
      trailColor: '#8a9b7e',
      trailSlug: trail.slug,
      level: null,
      href: `/medicina-veterinaria/${m.slug}`,
    }))
  );
}

function mapNeurocienciaModule(): BaseModuleSummary[] {
  // Mesma lógica do medvet: hardcode da cor accent (violet) pra evitar
  // ciclo de import com o NEUROCIENCIA_THEME. Quando bases ganharem
  // trail.color próprio, trocar pra t.color.
  return NEUROCIENCIA_BASE.trails.flatMap(trail =>
    trail.modules.map(m => ({
      slug: m.slug,
      title: m.title,
      icon: m.icon,
      readTime: m.estimatedMin,
      xp: 0,
      trailName: trail.title,
      trailColor: '#7c3aed',
      trailSlug: trail.slug,
      level: null,
      href: `/neurociencia/${m.slug}`,
    }))
  );
}

/**
 * Retorna TODOS os módulos da base. Ordem importa: usada como sequência
 * sugerida (primeiro não-completo vira "start-fresh"/"daily" candidate).
 */
export function getAllModulesForBase(baseSlug: string): BaseModuleSummary[] {
  if (baseSlug === DEFAULT_BASE_SLUG /* tecnologia */) {
    return CURRICULUM.flatMap(t => t.modules.map(m => mapTechModule(t, m)));
  }
  if (baseSlug === 'medicina-veterinaria') {
    return mapMedvetModule();
  }
  if (baseSlug === 'neurociencia') {
    return mapNeurocienciaModule();
  }
  // Bases queued ou desconhecidas: vazio (componentes downstream escondem
  // a seção em vez de mostrar lixo).
  return [];
}

/** Conta módulos da base. Útil para stats sem alocar o array inteiro. */
export function countModulesForBase(baseSlug: string): number {
  return getAllModulesForBase(baseSlug).length;
}
