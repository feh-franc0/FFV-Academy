import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('dados')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description: hub.desc,
  keywords: hub.tagline,
  alternates: { canonical: `https://fernandofrancovalle.com/dados` },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: `https://fernandofrancovalle.com/dados`,
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="dados"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/dados"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="Postgres Internals · Data Engineering · dbt · DuckDB · Kafka · CDC · Search & IR"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="além do CRUD" />
    </>
  );
}
