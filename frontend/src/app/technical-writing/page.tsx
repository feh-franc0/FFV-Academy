import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail53')!;

export const metadata: Metadata = {
  title: 'Technical Writing & RFCs — FFV Academy',
  description:
    'Escrita técnica sênior em PT-BR: design docs, RFCs, ADRs, postmortems blameless, READMEs editoriais, docs de API vivas. Templates reais Google/Meta/Stripe. Escrever bem = escalar decisões.',
  keywords:
    'technical writing, design doc, rfc request for comments, adr, postmortem blameless, readme profissional',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
