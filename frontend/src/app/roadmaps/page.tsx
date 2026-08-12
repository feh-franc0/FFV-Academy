import type { Metadata } from 'next';
import { RoadmapsClient } from './RoadmapsClient';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  '5 jornadas curadas de longo prazo: Zero → Staff em IA, Dev Web → AWS Pro, Backend → Full-stack AI-Native, Claude Power → Harness Eng, Iniciante → Engenheiro Moderno. Trilhas inteiras em sequência orientada a objetivo.';

export const metadata: Metadata = {
  title: 'Roadmaps',
  description: DESCRICAO_CARTAO,
  alternates: { canonical: `${BASE}/roadmaps` },
  ...social({ titulo: `Roadmaps — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/roadmaps' }),
};

export default function RoadmapsPage() {
  return <RoadmapsClient />;
}
