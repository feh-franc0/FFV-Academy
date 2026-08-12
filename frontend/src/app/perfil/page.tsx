import type { Metadata } from 'next';
import { DevProfileClient } from '@/components/DevProfileClient';

export const metadata: Metadata = {
  // página pessoal do usuário — fora do índice de propósito.
  robots: { index: false, follow: false },
  title: 'Perfil Dev',
  description:
    'Seu perfil público de desenvolvedor: conquistas, trilhas em progresso, badges, estatísticas de estudo e desempenho em quizzes.',
  keywords:
    'perfil desenvolvedor ffv academy, dev profile, conquistas badges, progresso trilhas, estatísticas estudo ia',
};

export default function Page() {
  return <DevProfileClient />;
}
