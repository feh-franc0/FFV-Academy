import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('marketing')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Marketing Digital: posicionamento, branding, SEO técnico, conteúdo estratégico, métricas que importam (CAC, LTV, conversão), funil end-to-end.',
  keywords:
    'marketing digital, seo, branding, conteudo estrategico, cac, ltv, funil, conversao, growth, marketing para devs',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
