import { BaseThemeProvider } from '@/components/base/BaseThemeProvider';
import { getBaseBySlug } from '@/lib/bases/registry';

const base = getBaseBySlug('vendas');

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!base) return <>{children}</>;
  return <BaseThemeProvider theme={base.theme}>{children}</BaseThemeProvider>;
}
