import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  NEUROCIENCIA_BASE,
  getModuleBySlug,
  getAllModuleSlugs,
} from '@/lib/bases/neurociencia';
import { NEUROCIENCIA_THEME } from '@/lib/bases/neurociencia/theme';
import { BaseModule } from '@/components/base/BaseModule';

export async function generateStaticParams() {
  return getAllModuleSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = getModuleBySlug(slug);
  if (!found) {
    return { title: 'Módulo não encontrado — FFV Academy' };
  }
  return {
    title: `${found.module.title} — Neurociência — FFV Academy`,
    description: found.module.summary,
    alternates: { canonical: `https://fernandofrancovalle.com/neurociencia/${slug}` },
  };
}

export default async function NeurocienciaModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = getModuleBySlug(slug);
  if (!found) notFound();
  return (
    <BaseModule
      base={NEUROCIENCIA_BASE}
      trail={found.trail}
      module={found.module}
      theme={NEUROCIENCIA_THEME}
      basePath="/neurociencia"
    />
  );
}
