import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail19')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha de TypeScript sério em PT-BR: mental model, narrowing, discriminated unions, generics com variance, validação runtime (Zod), async/await, erros como valores, performance em Node, monorepo com pnpm/turbo e capstone CLI end-to-end. O TS que times profissionais escrevem.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/typescript-profissional` },
  ...social({ titulo: `TypeScript Profissional — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/typescript-profissional' }),
  title: 'TypeScript Profissional',
  description: DESCRICAO_CARTAO,
  keywords:
    'typescript profissional, narrowing discriminated unions, generics typescript, variance typescript, zod runtime, result neverthrow, pnpm turbo monorepo, cli typescript capstone',
};

export default function TypeScriptProfissionalPage() {
  return <TrailBlogClient trail={trail} />;
}
