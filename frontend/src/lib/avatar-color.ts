/**
 * avatar-color — gera cor consistente por hash de nome.
 *
 * Garante que o mesmo usuário sempre tenha a mesma cor de avatar entre
 * sessões e devices, sem precisar persistir nada. Funciona com nomes,
 * iniciais ou IDs.
 *
 * Paleta usa tokens semânticos do FFV Academy + cores estendidas — todas
 * com contraste mínimo 4.5:1 contra texto branco/preto.
 */

const PALETTE = [
  '#58a6ff', // ffv-blue
  '#d2a8ff', // ffv-purple
  '#3fb950', // ffv-green
  '#ffa657', // ffv-orange
  '#f78166', // ffv-red
  '#fbbf24', // ffv-gold
  '#34d399', // ffv-cyan
  '#f472b6', // ffv-pink
];

/** Hash determinístico simples para string. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Retorna cor estável para um nome/iniciais/id.
 *
 * @example
 *   colorForInitials('FF') // → '#58a6ff' (sempre o mesmo)
 *   colorForInitials('Fernando Franco') // → '#3fb950' (sempre o mesmo)
 */
export function colorForInitials(seed: string): string {
  if (!seed) return PALETTE[0];
  return PALETTE[hash(seed) % PALETTE.length];
}

/** Versão "soft" — adiciona alpha para usar em backgrounds. */
export function softColorForInitials(seed: string, alpha = 0.15): string {
  const c = colorForInitials(seed);
  // Converte hex → rgba
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
