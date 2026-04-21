import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail47')!;

export const metadata: Metadata = {
  title: 'Go Profissional — FFV Academy',
  description:
    'Go 2026 idiomático: mental model simplicity first, goroutines e channels, context para cancelamento, interfaces pequenas, error handling explícito, generics (1.18+), performance com pprof e escape analysis, e capstone CLI + API com graceful shutdown. Em PT-BR, sem hype.',
  keywords:
    'go profissional, goroutines channels, context go, interfaces pequenas, errors.is as, generics go 1.18, pprof escape analysis, cobra chi router',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
