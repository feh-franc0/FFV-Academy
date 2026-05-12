import type { Metadata } from 'next';
import { MaratonaClient } from '@/components/MaratonaClient';

export const metadata: Metadata = {
  title: 'Maratona de Revisão — FFV Academy',
  description: 'Configure uma sessão de revisão SRS personalizada: trilha, quantidade de cards, timer. Revisão espaçada com SM-2.',
};

export default function Page() {
  return <MaratonaClient />;
}
