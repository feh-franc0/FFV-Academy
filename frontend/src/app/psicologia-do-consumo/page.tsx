import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('psicologia-do-consumo')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Por que humanos compram, desejam e cedem a atalhos mentais — com evidência. Os 7 Gatilhos de Cialdini (reciprocidade, compromisso, prova social, autoridade, afinidade, escassez, unidade) e Neuroeconomia da Decisão (Kahneman, Ariely, Thaler, Damasio, Byron Sharp, Christensen Jobs-to-Be-Done). Aplicação prática em copy, landing, anúncio, pricing e vendas.',
  keywords:
    'psicologia do consumo, cialdini 7 princípios, kahneman thinking fast slow, dan ariely predictably irrational, richard thaler nudge, antonio damasio, byron sharp how brands grow, clayton christensen jobs to be done, ancoragem preço, prova social, escassez, gatilhos mentais, neuroeconomia, copywriting psicológico',
  alternates: { canonical: 'https://fernandofrancovalle.com/psicologia-do-consumo' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/psicologia-do-consumo',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="psicologia-do-consumo"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/psicologia-do-consumo"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="7 Gatilhos de Cialdini · System 1/2 Kahneman · Vieses Ariely · Nudge Thaler · Emoção Damasio · Penetração Byron Sharp · Jobs-to-Be-Done Christensen · Ancoragem · Decoy · Pricing"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="com ciência" />
    </>
  );
}
