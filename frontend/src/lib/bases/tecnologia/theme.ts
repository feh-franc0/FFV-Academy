import type { BaseTheme } from '../theme';

/**
 * Tema da base de Tecnologia — usa as CSS vars padrão da plataforma
 * (cream paper + navy + sage + amber editorial). Por ser a base default,
 * não sobrescreve nenhum var — o KnowledgeBaseHome aplica zero overrides.
 */
export const TECH_THEME: BaseTheme = {
  ink:         '#1c1917',
  paper:       '#faf7f2',
  cream:       '#ffffff',
  border:      '#e7e0d0',
  muted:       '#57534e',
  accent:      '#1e3a8a',  // navy
  accentLight: '#3b82f6',
  success:     '#15803d',
  hubColors:   ['#1e3a8a', '#0e7490', '#15803d', '#b45309'],
};
