import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('cinematografia')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Cinema com profundidade de conservatório, em PT-BR: linguagem cinematográfica, roteiro, storytelling visual, câmera ARRI/Sony/RED, direção de fotografia (Deakins/Lubezki/Storaro), mise-en-scène, edição (Walter Murch), som & trilha (Williams/Zimmer/Greenwood), produção e carreira de cineasta.',
  keywords:
    'cinematografia, cinema, roteiro, direção de fotografia, edição cinema, walter murch, roger deakins, emmanuel lubezki, storaro, john williams, hans zimmer, ARRI alexa, sony venice, RED, davinci resolve, ANCINE, festival cannes',
  alternates: { canonical: 'https://fernandofrancovalle.com/cinema' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/cinema',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="cinema"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/cinema"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="Linguagem cinematográfica · Roteiro · Storytelling visual · Câmera profissional · Direção de fotografia · Mise-en-scène · Edição · Som & trilha · Produção"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="com profundidade real" />
    </>
  );
}
