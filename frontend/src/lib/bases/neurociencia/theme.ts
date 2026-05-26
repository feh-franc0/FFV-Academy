import type { BaseTheme } from '../theme';

/**
 * Tema da base de Neurociência.
 *
 * Paleta inspirada em neurônios sob microscópio, sinapses fluorescentes e
 * imagens de fMRI: violeta profundo como cor primária (cor associada à mente,
 * imaginação e cognição em estudos cromáticos), pink dopamínico como acento
 * (recompensa, prazer) e cream-lilás claríssimo no fundo pra não cansar a
 * leitura longa típica de textos de neurociência.
 *
 * Princípios:
 * - Nada de azul-clínico frio (deixa o conteúdo médico/distante).
 * - Nada de neon (a luz forte cansa pra textos longos de 18-25 minutos).
 * - Violeta + magenta + âmbar = tríade neuroquímica visual: dopamina,
 *   serotonina e expectativa.
 * - Cream-lilás (#faf8ff) papel quente como base — leitura tranquila.
 */
export const NEUROCIENCIA_THEME: BaseTheme = {
  ink:         '#2a1a4a',  // violeta profundo — tipografia/headings
  paper:       '#faf8ff',  // lavender white — fundo principal
  cream:       '#fcfbff',  // off-white frio — surfaces/cards
  border:      '#e6def5',  // lilás suave — bordas
  muted:       '#6b5b8a',  // warm grey-violet — texto secundário
  accent:      '#7c3aed',  // violet 600 — PRIMÁRIA (CTAs, links, kickers)
  accentLight: '#ec4899',  // pink 500 — hover/highlights (dopamina)
  success:     '#10b981',  // emerald — sucesso/badges
  // 4 cores dos hubs — Cérebro & Comportamento, Atenção·Memória·Emoção,
  // Persuasão & Vieses, Aplicação Prática. Paleta neuroquímica:
  // violet (cognição), pink (recompensa), amber (atenção), cyan (calma analítica).
  hubColors:   ['#7c3aed', '#ec4899', '#f59e0b', '#06b6d4'],
  // Reescreve "extras" da paleta global pra harmonizar com violet+pink+amber.
  // Sem isso, callouts/quests que usam --ffv-amber/orange/pink/yellow
  // vazam o navy+amber editorial da tech pra dentro da neurociência.
  extras: {
    amber:  '#f59e0b',  // âmbar atenção
    orange: '#fb923c',  // laranja ativação
    pink:   '#ec4899',  // pink dopamina
    yellow: '#fbbf24',  // amarelo memória
  },
};
