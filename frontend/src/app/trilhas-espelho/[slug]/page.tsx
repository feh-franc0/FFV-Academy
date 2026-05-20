import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getTrilhaEspelhoBySlug,
  listTrilhasEspelho,
  totalEstimatedHours,
} from '@/lib/trilhas-espelho';
import { TrilhaEspelhoClient } from './TrilhaEspelhoClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * generateStaticParams — pré-renderiza todas as trilhas espelho do catálogo.
 * Quando o backend de agregação estiver pronto (V2), aqui vira fetch dinâmico.
 */
export function generateStaticParams() {
  return listTrilhasEspelho().map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trilha = getTrilhaEspelhoBySlug(slug);
  if (!trilha) return { title: 'Trilha não encontrada — FFV Academy' };

  const hours = totalEstimatedHours(trilha);
  const title = `${trilha.examName} (${trilha.examEdition}) — plano de estudo FFV`;
  const description = `${trilha.pitch} ${trilha.modules.length} módulos · ${hours}h estimadas · construído com material de ${trilha.contributorCount} alunos.`;

  return {
    title,
    description,
    keywords: `${trilha.examName}, ${trilha.examEdition}, plano de estudo, simulado, FFV Academy`,
    alternates: { canonical: `https://fernandofrancovalle.com/trilhas-espelho/${trilha.slug}` },
    openGraph: { title, description, type: 'article' },
  };
}

/**
 * /trilhas-espelho/[slug] — Trilha Espelho pública agregada.
 *
 * Feature defensável #4 do MARKET_REFRESH_2026-05.md. SEO killer: cada
 * trilha vira página indexável com plano de estudo completo de uma
 * prova/concurso/edital específico.
 *
 * V1: catálogo hardcoded (lib/trilhas-espelho.ts). V2: backend agrega de
 * study_requests.subject + institution clustering quando volume ≥5.
 */
export default async function TrilhaEspelhoPage({ params }: PageProps) {
  const { slug } = await params;
  const trilha = getTrilhaEspelhoBySlug(slug);
  if (!trilha) notFound();
  return <TrilhaEspelhoClient trilha={trilha} />;
}
