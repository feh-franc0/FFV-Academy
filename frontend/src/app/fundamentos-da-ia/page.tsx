import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Fundamentos da IA — FFV Academy',
  description: 'Do zero ao LLM. Aprenda o que é IA, Machine Learning, Redes Neurais, Tokens e Transformers — com XP e quiz em cada artigo.',
};

export default function FundamentosPage() {
  return <TrailBlogClient trail={CURRICULUM[0]} />;
}
