import type { Base, Trail } from '../types';
import {
  MOD_1_TRIUNO,
  MOD_2_SISTEMAS,
  MOD_3_ATENCAO,
  MOD_4_MEMORIA,
} from './neuromarketing-modules-1';
import {
  MOD_5_HEURISTICAS,
  MOD_6_DOPAMINA,
  MOD_7_VISUAL,
  MOD_8_NEUROPRICING,
} from './neuromarketing-modules-2';

/**
 * Trilha "Neuromarketing — Como o cérebro decide comprar".
 *
 * Conteúdo curado a partir da solicitação: Área Saúde · PUC Neurociência ·
 * "Neurociência aplicada a Marketing". Sequência pedagógica vai do macro
 * (modelos do cérebro) ao aplicado (pricing e ética), passando pelos
 * sistemas (atenção, memória, recompensa) e vieses (Cialdini, Kahneman).
 *
 * Cada módulo segue padrão FFV: intro → conceitos → exemplo do dia a dia →
 * exemplo lúdico pra criança → tabela/comparativo → resumo + 7-8 quizzes.
 *
 * Material base: Schultz (1997), Kahneman (2011), Berridge & Robinson (1998),
 * Cialdini (1984, 2016), Knutson et al. (2007), Iyengar (2000),
 * Anderson & Simester (2003), Damásio (1994), MacLean (1990), Nielsen,
 * Bargh, Thaler & Kahneman (1990), B.F. Skinner.
 */
export const NEUROMARKETING_TRAIL: Trail = {
  slug: 'neuromarketing',
  title: 'Neuromarketing — Como o cérebro decide comprar',
  description:
    'Da neurociência básica ao marketing aplicado: 8 módulos sequenciais cobrindo cérebro triuno, sistemas 1 e 2 de Kahneman, atenção, memória, dopamina, vieses de Cialdini, design visual e pricing — sempre com exemplos do dia a dia, analogias lúdicas e exercícios pra fixar.',
  icon: '🧠',
  modules: [
    MOD_1_TRIUNO,
    MOD_2_SISTEMAS,
    MOD_3_ATENCAO,
    MOD_4_MEMORIA,
    MOD_5_HEURISTICAS,
    MOD_6_DOPAMINA,
    MOD_7_VISUAL,
    MOD_8_NEUROPRICING,
  ],
};

/**
 * Base de Neurociência aplicada.
 *
 * Atende solicitações de estudantes de cursos de Neurociência (PUC,
 * USP, UFMG e similares) que precisam estudar a interseção com
 * Marketing, Comunicação, UX e Behavioral Economics. Hubs separam por
 * grande tema: do cérebro biológico ao aplicado prático.
 */
export const NEUROCIENCIA_BASE: Base = {
  slug: 'neurociencia',
  name: 'Neurociência',
  area: 'Cérebro · Comportamento · Marketing · Decisão',
  description:
    'Base de Neurociência aplicada — comece pela trilha Neuromarketing, que cobre como o cérebro humano decide comprar: dos modelos triunos (MacLean) e sistemas duplos (Kahneman) à dopamina, vieses, design visual e pricing.',
  icon: '🧠',
  attribution:
    'Conteúdo curado pela FFV Academy a partir de fontes acadêmicas primárias: Kahneman (Pensar Rápido e Devagar), Cialdini (Influence, Pre-Suasion), Schultz (1997) sobre dopamina, Berridge sobre wanting vs liking, Knutson et al. (2007) sobre pain of paying, Iyengar (2000) sobre paradox of choice, Damásio sobre emoção e decisão. Atende solicitação original: estudante de Neurociência da PUC.',
  trails: [NEUROMARKETING_TRAIL],
  hubs: [
    {
      slug: 'cerebro-comportamento',
      name: 'Cérebro & Comportamento',
      icon: '🧠',
      description:
        'Os modelos fundamentais de como o cérebro humano decide: triuno (MacLean) e dual-process (Kahneman). Base pra entender tudo que vem depois.',
      colorIndex: 0,
      moduleSlugs: ['triuno-cerebro-do-consumidor', 'sistema-1-sistema-2-kahneman'],
    },
    {
      slug: 'atencao-memoria-emocao',
      name: 'Atenção, Memória & Emoção',
      icon: '💗',
      description:
        'Os três sistemas cognitivos que decidem o que VEMOS, o que LEMBRAMOS e o que SENTIMOS. Sem eles, não há decisão de compra.',
      colorIndex: 1,
      moduleSlugs: ['atencao-filtro-do-cerebro', 'memoria-emocao-marcas-grudam'],
    },
    {
      slug: 'persuasao-vieses',
      name: 'Persuasão & Vieses',
      icon: '🎯',
      description:
        'Os 6 princípios de Cialdini + dopamina e expectativa. Como cérebro toma atalhos — e como marcas exploram esses atalhos (com ou sem ética).',
      colorIndex: 2,
      moduleSlugs: ['heuristicas-vieses-marketing', 'dopamina-recompensa-expectativa'],
    },
    {
      slug: 'aplicacao-pratica',
      name: 'Aplicação Prática',
      icon: '🎨',
      description:
        'Da teoria à prateleira: design visual de embalagem, eye-tracking, cores, charm pricing, neuropricing e onde traçar a linha ética.',
      colorIndex: 3,
      moduleSlugs: ['neuromarketing-visual-cores-embalagem', 'neuropricing-etica-neuromarketing'],
    },
  ],
};

// Helpers de lookup — espelham a API do MEDVET_BASE pra consistência cross-base.
export function getTrailBySlug(trailSlug: string): Trail | undefined {
  return NEUROCIENCIA_BASE.trails.find(t => t.slug === trailSlug);
}

export function getModuleBySlug(
  moduleSlug: string,
): { trail: Trail; module: import('../types').Module } | undefined {
  for (const trail of NEUROCIENCIA_BASE.trails) {
    const mod = trail.modules.find(m => m.slug === moduleSlug);
    if (mod) return { trail, module: mod };
  }
  return undefined;
}

export function getAllModuleSlugs(): string[] {
  return NEUROCIENCIA_BASE.trails.flatMap(t => t.modules.map(m => m.slug));
}
