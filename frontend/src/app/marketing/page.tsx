import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('marketing')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Marketing digital com método: posicionamento de marca, branding, SEO orgânico, copywriting que vende, funil de aquisição, métricas que importam (CAC, LTV, conversão, retenção).',
  keywords:
    'marketing digital, seo orgânico, branding, copywriting, posicionamento, marca pessoal, funil de vendas, cac, ltv, conversão, tráfego, growth',
  alternates: { canonical: 'https://fernandofrancovalle.com/marketing' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/marketing',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="marketing"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/marketing"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="Posicionamento · Branding · SEO · CAC · LTV · Funil · Conversão"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="sem achismo" />
    </>
  );
}
