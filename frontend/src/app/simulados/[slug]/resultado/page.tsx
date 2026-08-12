import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';
import { ResultadoClient } from '@/components/simulado/ResultadoClient';

interface Params { slug: string; }

export function generateStaticParams(): Params[] {
  return SIMULADOS_CATALOG.map(s => ({ slug: s.id.replace(/^simulado-/, '') }));
}

export const metadata = {
  title: 'Resultado do simulado',
  robots: { index: false, follow: false },
};

export default async function ResultadoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <ResultadoClient slug={slug} />;
}
