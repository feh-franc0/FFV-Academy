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
    'Comunicação humana e escrita profissional: falar em público, conduzir reuniões, storytelling, dar e receber feedback, escuta ativa e documentos que convencem (propostas, atas, relatórios).',
  keywords:
    'comunicação profissional, falar em público, storytelling, dar feedback, escuta ativa, reuniões, escrita profissional, redação corporativa, oratória',
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
      <ProfissionalBaseHome hub={hub} heroHighlight="em qualquer profissão" />
    </>
  );
}
