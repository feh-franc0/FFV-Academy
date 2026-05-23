import type { Metadata } from 'next';
import { ProfissionalBaseHome } from '@/components/base/ProfissionalBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { getHubBySlug, getHubTrails } from '@/lib/curriculum';

const hub = getHubBySlug('empreendedorismo')!;
const trails = getHubTrails(hub);
const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
const workloadHours = Math.round(
  trails.reduce((acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0), 0) / 60,
);

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Empreendedorismo Digital ponta-a-ponta: validação de ideia, MVP, produtos digitais, infoprodutos, freelance, formalização MEI, primeiras vendas, modelo de assinatura, distribuição internacional.',
  keywords:
    'empreendedorismo digital, produto digital, infoproduto, freelance, mei, validação de ideia, mvp, modelo de assinatura, distribuição, primeiras vendas, indie',
  alternates: { canonical: 'https://fernandofrancovalle.com/empreendedorismo' },
  openGraph: {
    title: `${hub.name} — FFV Academy`,
    description: hub.tagline,
    type: 'website',
    url: 'https://fernandofrancovalle.com/empreendedorismo',
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BaseStructuredData
        slug="empreendedorismo"
        name={hub.name}
        description={hub.desc}
        url="https://fernandofrancovalle.com/empreendedorismo"
        modules={modulesCount}
        workloadHours={workloadHours}
        teaches="MVP · Solo SaaS · Indie Hacker · Stripe billing · Multi-tenancy · CAC/LTV · Pricing"
      />
      <ProfissionalBaseHome hub={hub} heroHighlight="virando dono" />
    </>
  );
}
