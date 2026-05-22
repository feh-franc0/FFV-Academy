import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('carreira')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Carreira & Liderança: Carreira Digital BR (portfólio, vagas, remoto, freelance) e Career Engineering (resume, LinkedIn, behavioral interview, negotiation, promo docs).',
  keywords:
    'carreira tech, carreira digital, career engineering, resume tech, linkedin dev, behavioral interview, negotiation, promotion, staff engineer',
  alternates: { canonical: 'https://fernandofrancovalle.com/carreira' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/carreira',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="carreira"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/carreira"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="Portfólio · Vagas · Behavioral Interview · Negotiation · Promoção"
      />
      <HubPageClient hub={hub} />
    </>
  );
}
