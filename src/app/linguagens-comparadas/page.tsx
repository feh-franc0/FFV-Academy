import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail48')!;

export const metadata: Metadata = {
  title: 'Comparação de Linguagens: Escolha Certa — FFV Academy',
  description:
    'Decisão de linguagem sem religião: type systems (static vs dynamic, structural vs nominal), concurrency (threads, async, CSP, Actor), memory (manual, GC, borrow checker), performance honesta, maturidade de ecosystem e matriz de decisão por domínio. Conteúdo sênior em PT-BR.',
  keywords:
    'comparação linguagens programação, type system dynamic static, concurrency threads async csp actor, memory gc borrow checker rust, benchmarks techempower, ecosystem maturity, matriz decisão linguagem',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
