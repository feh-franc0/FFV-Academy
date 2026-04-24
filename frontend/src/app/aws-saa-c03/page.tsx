import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'AWS Solutions Architect Associate (SAA-C03) — FFV Academy',
  description: 'Trilha profissional para a certificação AWS Certified Solutions Architect Associate (SAA-C03). Arquitetura de soluções resilientes, seguras, performáticas e com otimização de custos — cobrindo os 4 domínios oficiais com simulado comentado.',
};

export default function AwsSaaC03Page() {
  return <TrailBlogClient trail={CURRICULUM[4]} />;
}
