import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('comunicacao')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Comunicação Humana (falar em público, reuniões, storytelling, feedback) e Technical Writing & RFCs (design docs, RFCs, ADRs, postmortems, READMEs).',
  keywords:
    'comunicacao profissional, falar em publico, storytelling, technical writing, rfc, adr, design doc, postmortem, escrita tecnica',
  alternates: { canonical: 'https://fernandofrancovalle.com/comunicacao' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/comunicacao',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="comunicacao"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/comunicacao"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="Falar em público · Reuniões · Storytelling · Feedback · Technical Writing · RFCs · ADRs"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="multiplica engenheiros" />
    </>
  );
}
