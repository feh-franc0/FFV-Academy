import type { Metadata } from 'next';
import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';
import { SimuladoDetailClient } from './SimuladoDetailClient';
import { BASE, social } from '@/lib/metadata-social';

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return SIMULADOS_CATALOG.map(s => ({ slug: s.id.replace(/^simulado-/, '') }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const sim = SIMULADOS_CATALOG.find(s => s.id === `simulado-${slug}`);
  if (!sim) return { title: 'Simulado não encontrado' };
  return {
    // Sem sufixo: o template do layout raiz o aplica — escrever à mão aqui
    // produzia `<title>X — FFV Academy — FFV Academy</title>`.
    title: sim.title,
    description: sim.description,
    alternates: { canonical: `${BASE}/simulados/${slug}` },
    ...social({
      titulo: `${sim.title} — FFV Academy`,
      descricao: sim.description,
      caminho: `/simulados/${slug}`,
    }),
  };
}

export default async function SimuladoDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <SimuladoDetailClient slug={slug} />;
}
