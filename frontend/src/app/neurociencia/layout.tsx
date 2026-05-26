import { BaseThemeProvider } from '@/components/base/BaseThemeProvider';
import { NEUROCIENCIA_THEME } from '@/lib/bases/neurociencia/theme';

/**
 * Layout da base de Neurociência — aplica NEUROCIENCIA_THEME globalmente
 * (incluindo GameHUD, footer e demais elementos do app chrome) via
 * BaseThemeProvider. Sem isso, a top bar herdaria o navy da tech enquanto
 * o conteúdo central usaria violet — inconsistente.
 */
export default function NeurocienciaLayout({ children }: { children: React.ReactNode }) {
  return <BaseThemeProvider theme={NEUROCIENCIA_THEME}>{children}</BaseThemeProvider>;
}
