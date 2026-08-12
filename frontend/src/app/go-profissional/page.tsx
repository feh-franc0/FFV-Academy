import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail47')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Go 2026 idiomático: mental model simplicity first, goroutines e channels, context para cancelamento, interfaces pequenas, error handling explícito, generics (1.18+), performance com pprof e escape analysis, e capstone CLI + API com graceful shutdown. Em PT-BR, sem hype.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/go-profissional` },
  ...social({ titulo: `Go Profissional — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/go-profissional' }),
  title: 'Go Profissional',
  description: DESCRICAO_CARTAO,
  keywords:
    'go profissional, goroutines channels, context go, interfaces pequenas, errors.is as, generics go 1.18, pprof escape analysis, cobra chi router',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
