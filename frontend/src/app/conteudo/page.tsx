import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('conteudo')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Criação de conteúdo digital ponta-a-ponta: estratégia editorial, gravação áudio+vídeo, edição, publicação multi-plataforma, métricas e monetização.',
  keywords:
    'criacao de conteudo, youtube, linkedin, gravacao, edicao, audiencia, monetizacao, personal brand, dev content',
  alternates: { canonical: 'https://fernandofrancovalle.com/conteudo' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/conteudo',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="conteudo"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/conteudo"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="Estratégia editorial · Gravação · Edição · Publicação · Monetização de audiência"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="como engineer" />
    </>
  );
}
