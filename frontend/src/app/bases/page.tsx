import type { Metadata } from 'next';
import { BasesClient } from '@/components/BasesClient';

export const metadata: Metadata = {
  title: 'Bases de conhecimento — FFV Academy',
  description:
    'Explore as bases de conhecimento criadas e em fila — Tecnologia, Medicina, Direito, Design, Engenharia e mais. Não vê a sua? Solicite — em 24h ela está no ar.',
  alternates: { canonical: 'https://fernandofrancovalle.com/bases' },
};

export default function BasesPage() {
  return <BasesClient />;
}
