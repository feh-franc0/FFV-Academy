import type { BaseTheme } from './theme';

/**
 * Tema editorial usado nas rotas de marketing (/, /sobre, /comunidade,
 * /newsletter, /bases). Mesmo padrão visual da landing — cream paper + navy
 * + amber editorial. Aplicado via BaseThemeProvider pra GARANTIR consistência
 * mesmo se o usuário tiver dark mode global ativo.
 */
export const MARKETING_THEME: BaseTheme = {
  ink:         '#1c1917',  // stone-900 — text/headings
  paper:       '#faf7f2',  // cream paper
  cream:       '#ffffff',  // white surfaces
  border:      '#e7e0d0',  // cream-200
  muted:       '#57534e',  // stone-600
  accent:      '#1e3a8a',  // navy autoridade
  accentLight: '#b45309',  // amber editorial (usado em "pronta amanhã")
  success:     '#15803d',  // sage forest
  hubColors:   ['#1e3a8a', '#0e7490', '#15803d', '#b45309'],
};
