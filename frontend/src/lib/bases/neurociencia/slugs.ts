/**
 * Lista plana de slugs dos módulos da base Neurociência — sem importar o
 * conteúdo pesado (sections, quiz, keyTerms). Usado por resolvers/selectors
 * que só precisam saber "este slug pertence a neurociencia" sem pagar o
 * custo de bundle dos módulos completos.
 *
 * Quando adicionar/remover módulo na trilha, atualizar aqui também.
 */
export const NEUROCIENCIA_MODULE_SLUGS: string[] = [
  // Hub 1 — Cérebro & Comportamento
  'triuno-cerebro-do-consumidor',
  'sistema-1-sistema-2-kahneman',
  // Hub 2 — Atenção, Memória & Emoção
  'atencao-filtro-do-cerebro',
  'memoria-emocao-marcas-grudam',
  // Hub 3 — Persuasão & Vieses
  'heuristicas-vieses-marketing',
  'dopamina-recompensa-expectativa',
  // Hub 4 — Aplicação Prática
  'neuromarketing-visual-cores-embalagem',
  'neuropricing-etica-neuromarketing',
];

/** Metadata leve dos módulos pra recomendações sem pagar bundle pesado. */
export interface NeurocienciaModuleLite {
  slug: string;
  title: string;
  estimatedMin: number;
  icon: string;
}

export const NEUROCIENCIA_MODULES_LITE: NeurocienciaModuleLite[] = [
  { slug: 'triuno-cerebro-do-consumidor',         title: 'Os 3 Cérebros do Consumidor — réptil, límbico, neocórtex',         estimatedMin: 18, icon: '🧠' },
  { slug: 'sistema-1-sistema-2-kahneman',         title: 'Sistema 1 e Sistema 2 — pensamento rápido e devagar (Kahneman)',  estimatedMin: 20, icon: '⚡' },
  { slug: 'atencao-filtro-do-cerebro',            title: 'Atenção — o filtro que decide o que o cérebro vê',                 estimatedMin: 18, icon: '👁️' },
  { slug: 'memoria-emocao-marcas-grudam',         title: 'Memória & Emoção — por que algumas marcas grudam',                 estimatedMin: 20, icon: '💗' },
  { slug: 'heuristicas-vieses-marketing',         title: 'Heurísticas e Vieses — atalhos mentais que vendem',                estimatedMin: 22, icon: '🎯' },
  { slug: 'dopamina-recompensa-expectativa',      title: 'Dopamina, Recompensa e Expectativa — o motor da decisão',          estimatedMin: 18, icon: '🎰' },
  { slug: 'neuromarketing-visual-cores-embalagem', title: 'Neuromarketing Visual — cores, embalagem e eye-tracking',         estimatedMin: 20, icon: '🎨' },
  { slug: 'neuropricing-etica-neuromarketing',    title: 'Neuropricing e Ética — como o cérebro percebe preço',              estimatedMin: 18, icon: '💸' },
];
