import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('programacao')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description: hub.desc,
  keywords: hub.tagline,
  alternates: { canonical: `https://fernandofrancovalle.com/programacao` },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: `https://fernandofrancovalle.com/programacao`,
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="programacao"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/programacao"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="TypeScript · DS&A · Python · Go · Rust · C · Modern Languages"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="como times profissionais" />
    </>
  );
}
