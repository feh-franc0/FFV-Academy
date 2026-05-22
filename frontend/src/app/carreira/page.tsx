import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('carreira')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Carreira & Liderança: Carreira Digital BR (portfólio, vagas, remoto, freelance) e Career Engineering (resume, LinkedIn, behavioral interview, negotiation, promo docs).',
  keywords:
    'carreira tech, carreira digital, career engineering, resume tech, linkedin dev, behavioral interview, negotiation, promotion, staff engineer',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
