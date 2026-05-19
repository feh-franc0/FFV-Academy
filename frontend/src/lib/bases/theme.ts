/**
 * BaseTheme — sistema de tema para bases de conhecimento.
 *
 * Cada base (medvet, direito, design, medicina...) define seu próprio tema:
 * paleta, gradientes, cores dos hubs temáticos. O resto (estrutura, layout,
 * componentes) é compartilhado em `src/components/base/`.
 *
 * Adicionar uma nova base = criar data (Module/Trail/Base) + um theme + page.tsx.
 */

export interface BaseTheme {
  /** Cor primária (escura — usada em CTAs sólidos e textos de destaque) */
  ink: string;
  /** Cor de fundo principal (cream, paper, etc) */
  paper: string;
  /** Superfície terciária (cream-200, levemente mais escura que paper) */
  cream: string;
  /** Cor da borda padrão */
  border: string;
  /** Cor de texto secundário */
  muted: string;
  /** Cor de acento principal (kickers, destaques, gradients) */
  accent: string;
  /** Versão clara do acento (pra texto sobre fundo escuro) */
  accentLight: string;
  /** Sucesso / "no ar" (sage, emerald, etc) */
  success: string;

  /** 4 cores dos hubs temáticos (na ordem dos hubs definidos) */
  hubColors: [string, string, string, string];

  /** Gradientes opcionais do hero (composição CSS) */
  heroGradient?: string;

  /**
   * Cores "extras" da paleta FFV (--ffv-amber, --ffv-orange, --ffv-pink,
   * --ffv-yellow). Aparecem em gradientes da home, callouts e quests. Quando
   * uma base define estas, o BaseThemeProvider as injeta como CSS vars,
   * fechando o vazamento de paleta entre bases (ex.: medvet não herdar o
   * amber da tech). Se omitido, fica com o default global do light mode.
   */
  extras?: {
    amber?: string;
    orange?: string;
    pink?: string;
    yellow?: string;
  };
}

/**
 * Tema padrão FFV — usado como base.
 * Bases específicas (medvet, etc) podem estender/sobrescrever.
 */
export const DEFAULT_THEME: BaseTheme = {
  ink:         '#1c1917',
  paper:       '#faf7f2',
  cream:       '#f5f1e8',
  border:      '#e7e0d0',
  muted:       '#57534e',
  accent:      '#b45309',
  accentLight: '#fbbf24',
  success:     '#15803d',
  hubColors:   ['#4f46e5', '#0891b2', '#15803d', '#b45309'],
  heroGradient:
    'radial-gradient(ellipse 50% 50% at 80% 0%, color-mix(in srgb, #b45309 12%, transparent) 0%, transparent 65%),'
    + 'radial-gradient(ellipse 50% 40% at 0% 100%, color-mix(in srgb, #15803d 8%, transparent) 0%, transparent 65%)',
};
