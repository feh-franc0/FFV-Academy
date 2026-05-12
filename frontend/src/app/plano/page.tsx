import type { Metadata } from 'next';
import { PlanoClient } from '@/components/PlanoClient';

export const metadata: Metadata = {
  title: 'Plano de Estudos Personalizado — FFV Academy',
  description:
    'Gere um plano de estudos semana a semana baseado no seu objetivo (AWS SAA, Backend Sênior, ML Engineer, etc.) e no seu progresso atual. Gratuito e 100% local.',
  alternates: { canonical: 'https://fernandofrancovalle.com/plano' },
};

export default function PlanoPage() {
  return <PlanoClient />;
}
