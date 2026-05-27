import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NEUROCIENCIA_BASE } from '@/lib/bases/neurociencia';
import { NEUROCIENCIA_THEME } from '@/lib/bases/neurociencia/theme';
import { BaseHubPageClient } from '@/components/base/BaseHubPageClient';

const BASE_PATH = '/neurociencia';
const BASE_NAME = 'Neurociência';

export function generateStaticParams() {
  return (NEUROCIENCIA_BASE.hubs ?? []).map(h => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hub = NEUROCIENCIA_BASE.hubs?.find(h => h.slug === slug);
  if (!hub) return { title: 'Hub não encontrado — FFV Academy' };
  return {
    title: `${hub.name} — Neurociência aplicada — FFV Academy`,
    description: hub.description,
    alternates: { canonical: `https://fernandofrancovalle.com${BASE_PATH}/hub/${hub.slug}` },
  };
}

export default async function NeurocienciaHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hub = NEUROCIENCIA_BASE.hubs?.find(h => h.slug === slug);
  if (!hub) notFound();

  const modulesBySlug = new Map(
    NEUROCIENCIA_BASE.trails.flatMap(t => t.modules.map(m => [m.slug, m] as const)),
  );
  const modules = hub.moduleSlugs
    .map(s => modulesBySlug.get(s))
    .filter((m): m is NonNullable<typeof m> => !!m);

  const color = NEUROCIENCIA_THEME.hubColors[hub.colorIndex];

  return (
    <BaseHubPageClient
      hub={hub}
      color={color}
      modules={modules}
      basePath={BASE_PATH}
      baseName={BASE_NAME}
    />
  );
}
