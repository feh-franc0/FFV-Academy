import { BaseThemeProvider } from '@/components/base/BaseThemeProvider';
import { MEDVET_THEME } from '@/lib/bases/medvet/theme';

/**
 * Layout da base de Medicina Veterinária — aplica MEDVET_THEME globalmente
 * (incluindo GameHUD, footer e demais elementos do app chrome) via
 * BaseThemeProvider. Sem isso, o usuário em dark mode veria a top bar preta
 * e o conteúdo cream — inconsistente com a identidade da base.
 */
export default function MedvetLayout({ children }: { children: React.ReactNode }) {
  return <BaseThemeProvider theme={MEDVET_THEME}>{children}</BaseThemeProvider>;
}
