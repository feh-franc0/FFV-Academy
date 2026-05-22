import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('empreendedorismo')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Empreendedorismo Digital: Empreendedorismo Digital (validação, MVP, infoprodutos, freelance) e Solo SaaS / Indie Hacker Stack (Stripe, multi-tenancy, CAC/LTV, pricing).',
  keywords:
    'empreendedorismo digital, solo saas, indie hacker, stripe, mvp, infoproduto, freelance, founder, side project',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
