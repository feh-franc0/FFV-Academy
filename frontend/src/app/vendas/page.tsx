import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('vendas')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Vendas B2B modernas com método: SPIN Selling (Neil Rackham), Challenger Sale (Dixon & Adamson), Sandler, MEDDIC/MEDDPICC, discovery call profissional, demo tailored, tratamento de objeções, pipeline & forecast, AI sales 2026 — e fechamento via tactical empathy de Chris Voss (FBI).',
  keywords:
    'vendas B2B, SPIN selling, neil rackham, challenger sale, sandler, MEDDIC, MEDDPICC, chris voss, never split the difference, tactical empathy, mirroring, labeling, accusation audit, discovery call, demo SaaS, gong, apollo, clay, outreach',
  alternates: { canonical: 'https://fernandofrancovalle.com/vendas' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/vendas',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="vendas"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/vendas"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="Vendas consultivas · SPIN · Challenger · Sandler · MEDDIC · Discovery · Demo · Objeções · Pipeline · Tactical Empathy · Negociação Chris Voss"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="como engenharia" />
    </>
  );
}
