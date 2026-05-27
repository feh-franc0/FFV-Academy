import { BaseThemeProvider } from '@/components/base/BaseThemeProvider';
import { getBaseBySlug } from '@/lib/bases/registry';

/**
 * Layout da base conteudo — aplica o theme da base globalmente
 * (GameHUD, footer e todo o app chrome) via BaseThemeProvider.
 * Criado 2026-05-26 pra padronizar com medicina-veterinaria/neurociencia
 * que já tinham layout próprio.
 */
const base = getBaseBySlug('conteudo');

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!base) return <>{children}</>;
  return <BaseThemeProvider theme={base.theme}>{children}</BaseThemeProvider>;
}
