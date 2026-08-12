import type { Metadata } from 'next';
import { PlanoClient } from '@/components/PlanoClient';

export const metadata: Metadata = {
  // Plano gerado a partir do objetivo e do progresso DO usuário — rastreador vê
  // só o seletor vazio. Fora do índice pelo mesmo princípio de `/progresso`.
  robots: { index: false, follow: false },
  title: 'Plano de Estudos Personalizado',
  description:
    'Gere um plano de estudos semana a semana baseado no seu objetivo (AWS SAA, Backend Sênior, ML Engineer, etc.) e no seu progresso atual. Gratuito e 100% local.',
  alternates: { canonical: 'https://fernandofrancovalle.com/plano' },
};

export default function PlanoPage() {
  return <PlanoClient />;
}
