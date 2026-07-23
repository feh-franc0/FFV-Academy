import type { BaseTheme } from '../theme';

/**
 * Tema da base de Medicina Veterinária.
 *
 * Paleta inspirada em clínicas veterinárias rurais + brands de cuidado natural
 * (Aesop, Glossier, marcas de fitoterapia). Sage green como cor primária —
 * pesquisas de cor mostram que verde-sálvia é uma das poucas cores que tanto
 * mulheres quanto homens consideram calmante e bonita simultaneamente; é
 * associada a cuidado, saúde, natureza e cura. Acentos em terracota e mel
 * dão calor sem cair em estereótipos.
 *
 * Princípios:
 * - Nada de azul tech (médico-clínico frio).
 * - Nada de rosa puro (pode alienar homens da veterinária rural/zootecnia).
 * - Nada de neon/saturação alta (sensação clínica, não acolhedora).
 * - Cream/ivory papel quente como base — convida leitura longa.
 */
export const MEDVET_THEME: BaseTheme = {
  ink:         '#2d4a3e',  // forest sage — tipografia/headings
  paper:       '#fbf7f0',  // warm ivory — fundo principal
  cream:       '#fdfbf6',  // off-white quente — surfaces/cards
  border:      '#e0d4ba',  // sand soft — bordas
  muted:       '#6b6358',  // warm taupe — texto secundário
  accent:      '#8a9b7e',  // sage green — PRIMÁRIA (CTAs, links, kickers)
  accentLight: '#d4a574',  // honey gold — hover/highlights
  success:     '#6b9080',  // forest sage — sucesso/badges
  // 5 cores dos hubs — todas harmonizando: sage, terracota, mauve, mel, forest.
  // 5ª (forest sage escuro) adicionada em mai/2026 com o hub
  // "Avaliação e Seleção Genética" (separação do hub Melhoramento).
  hubColors:   ['#8a9b7e', '#b08968', '#a07775', '#c19a78', '#5e8068'],
  // Reescreve os "extras" da paleta global pra harmonizar com sage/terracota.
  // Sem isso, callouts/quests/gradientes que usam --ffv-amber/orange/pink/yellow
  // vazam o navy+amber editorial da tech pra dentro da medvet.
  extras: {
    amber:  '#c19a78',  // mel suave
    orange: '#b08968',  // terracota
    pink:   '#a07775',  // mauve poeirento
    yellow: '#d4a574',  // honey gold
  },
};
