import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';
import { SimuladoRunner } from '@/components/simulado/SimuladoRunner';

interface Params { slug: string; }

export function generateStaticParams(): Params[] {
  return SIMULADOS_CATALOG.map(s => ({ slug: s.id.replace(/^simulado-/, '') }));
}

export const metadata = {
  title: 'Fazendo simulado — FFV Academy',
  robots: { index: false, follow: false },
};

export default async function FazerPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <SimuladoRunner slug={slug} />;
}
