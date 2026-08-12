import type { Metadata } from 'next';
import { TimesClient } from '@/components/TimesClient';

export const metadata: Metadata = {
  // O conteúdo é o time DO usuário. Fora do índice pelo mesmo princípio de
  // `/progresso`: painel pessoal não é página do site.
  robots: { index: false, follow: false },
  title: 'Times',
  description: 'Crie ou participe de um time de estudos. Acompanhe o progresso do grupo, compare XP e acelere o aprendizado em conjunto.',
  alternates: { canonical: 'https://fernandofrancovalle.com/times' },
};

export default function TimesPage() {
  return <TimesClient />;
}
