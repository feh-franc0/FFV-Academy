import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
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
    'Carreira profissional como sistema: portfólio, busca de vagas no Brasil e exterior, entrevista comportamental, negociação salarial, promoção e mental model de quem cresce de sênior para liderança.',
  keywords:
    'carreira profissional, carreira digital, busca de vagas, portfólio, entrevista comportamental, negociação salarial, promoção, linkedin, trabalho remoto, freelance',
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
      <ProfissionalBaseHome hub={hub} heroHighlight="se posicionar profissionalmente" />
    </>
  );
}
