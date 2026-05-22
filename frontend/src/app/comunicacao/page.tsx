import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('comunicacao')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Comunicação: Comunicação Humana (falar em público, reuniões, storytelling, feedback) e Technical Writing & RFCs (design docs, RFCs, ADRs, postmortems, READMEs).',
  keywords:
    'comunicacao profissional, falar em publico, storytelling, technical writing, rfc, adr, design doc, postmortem, escrita tecnica',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
