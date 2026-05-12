import type { Metadata } from 'next';
import { TimesClient } from '@/components/TimesClient';

export const metadata: Metadata = {
  title: 'Times — FFV Academy',
  description: 'Crie ou participe de um time de estudos. Acompanhe o progresso do grupo, compare XP e acelere o aprendizado em conjunto.',
  alternates: { canonical: 'https://fernandofrancovalle.com/times' },
};

export default function TimesPage() {
  return <TimesClient />;
}
