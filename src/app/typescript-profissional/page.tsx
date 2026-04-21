import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail19')!;

export const metadata: Metadata = {
  title: 'TypeScript Profissional — FFV Academy',
  description:
    'Trilha de TypeScript sério em PT-BR: mental model, narrowing, discriminated unions, generics com variance, validação runtime (Zod), async/await, erros como valores, performance em Node, monorepo com pnpm/turbo e capstone CLI end-to-end. O TS que times profissionais escrevem.',
  keywords:
    'typescript profissional, narrowing discriminated unions, generics typescript, variance typescript, zod runtime, result neverthrow, pnpm turbo monorepo, cli typescript capstone',
};

export default function TypeScriptProfissionalPage() {
  return <TrailBlogClient trail={trail} />;
}
