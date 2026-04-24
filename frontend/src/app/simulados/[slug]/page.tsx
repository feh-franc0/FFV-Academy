import type { Metadata } from 'next';
import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';
import { SimuladoDetailClient } from './SimuladoDetailClient';

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return SIMULADOS_CATALOG.map(s => ({ slug: s.id.replace(/^simulado-/, '') }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const sim = SIMULADOS_CATALOG.find(s => s.id === `simulado-${slug}`);
  if (!sim) return { title: 'Simulado não encontrado — FFV Academy' };
  return {
    title: `${sim.title} — FFV Academy`,
    description: sim.description,
    alternates: { canonical: `https://fernandofrancovalle.com/simulados/${slug}` },
  };
}

export default async function SimuladoDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <SimuladoDetailClient slug={slug} />;
}
