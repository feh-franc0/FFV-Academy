import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HUBS } from '@/lib/curriculum';
import { getBankForHub } from '@/lib/question-bank';
import { HubQuestionsClient } from './HubQuestionsClient';

interface Props {
  params: Promise<{ hub: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hub: hubId } = await params;
  const hub = HUBS.find(h => h.id === hubId);
  if (!hub) return { title: 'Hub não encontrado — FFV Academy' };
  return {
    title: `Questões · ${hub.name} — FFV Academy`,
    description: `100 questões de ${hub.name} pra praticar (fácil / médio / difícil).`,
    alternates: { canonical: `https://fernandofrancovalle.com/questoes/${hubId}` },
  };
}

export default async function HubQuestionsPage({ params }: Props) {
  const { hub: hubId } = await params;
  const hub = HUBS.find(h => h.id === hubId);
  if (!hub) notFound();

  const bank = getBankForHub(hub.id);
  return <HubQuestionsClient hub={hub} bank={bank} />;
}
