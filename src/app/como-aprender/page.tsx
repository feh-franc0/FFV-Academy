import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Como Aprender — Psicologia do Aprendizado — FFV Academy',
  description: 'Trilha de meta-aprendizado: as técnicas com maior evidência científica para fixar conhecimento de verdade. Revisão espaçada, recall ativo, técnica Feynman, interleaving, deep work e hábito diário.',
};

export default function ComoAprenderPage() {
  return <TrailBlogClient trail={CURRICULUM[5]} />;
}
