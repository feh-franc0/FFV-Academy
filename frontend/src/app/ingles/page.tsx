import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('ingles')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Inglês para Brasileiros na Gringa: gramática essencial + 10 cenários reais do dia a dia (aeroporto, moradia, supermercado, restaurante, trabalho, médico, banco, transporte, situações sociais, telefone) com 100 trocas cada.',
  keywords:
    'inglês para brasileiros, inglês na gringa, inglês conversação, gramática inglês, aprender inglês, inglês para viagem, inglês para morar no exterior',
  alternates: { canonical: 'https://fernandofrancovalle.com/ingles' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/ingles',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="ingles"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/ingles"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="Gramática essencial · Vocabulário · 10 cenários reais · Inglês profissional na gringa"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="na gringa" />
    </>
  );
}
