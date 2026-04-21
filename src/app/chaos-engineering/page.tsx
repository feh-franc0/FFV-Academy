import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail66')!;

export const metadata: Metadata = {
  title: 'Chaos Engineering — FFV Academy',
  description:
    'Chaos engineering como disciplina em PT-BR: princípios Netflix, Chaos Monkey + Gremlin, LitmusChaos K8s, game days estruturados, fault injection (tc, stress-ng, AWS FIS, Istio).',
  keywords:
    'chaos engineering, chaos monkey netflix, gremlin chaos, litmuschaos kubernetes, game day sre, fault injection aws fis, istio fault injection',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
