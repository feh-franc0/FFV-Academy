import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('empreendedorismo')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Empreendedorismo Digital: Empreendedorismo Digital (validação, MVP, infoprodutos, freelance) e Solo SaaS / Indie Hacker Stack (Stripe, multi-tenancy, CAC/LTV, pricing).',
  keywords:
    'empreendedorismo digital, solo saas, indie hacker, stripe, mvp, infoproduto, freelance, founder, side project',
  alternates: { canonical: 'https://fernandofrancovalle.com/empreendedorismo' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/empreendedorismo',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="empreendedorismo"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/empreendedorismo"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="MVP · Solo SaaS · Indie Hacker · Stripe billing · Multi-tenancy · CAC/LTV · Pricing"
      />
      <HubPageClient hub={hub} />
    </>
  );
}
