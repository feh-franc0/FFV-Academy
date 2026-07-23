import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MEDVET_BASE, getModuleBySlug, getAllModuleSlugs } from '@/lib/bases/medvet';
import { MEDVET_THEME } from '@/lib/bases/medvet/theme';
import { BaseModule } from '@/components/base/BaseModule';

export async function generateStaticParams() {
  return getAllModuleSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = getModuleBySlug(slug);
  if (!found) {
    return { title: 'Módulo não encontrado — FFV Academy' };
  }
  return {
    title: `${found.module.title} — Genética Veterinária — FFV Academy`,
    description: found.module.summary,
    alternates: { canonical: `https://fernandofrancovalle.com/medicina-veterinaria/${slug}` },
  };
}

export default async function MedvetModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = getModuleBySlug(slug);
  if (!found) notFound();
  return (
    <BaseModule
      base={MEDVET_BASE}
      trail={found.trail}
      module={found.module}
      theme={MEDVET_THEME}
      basePath="/medicina-veterinaria"
    />
  );
}
