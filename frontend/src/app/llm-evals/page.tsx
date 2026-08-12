import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail26')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Evals como disciplina em PT-BR: por que testar LLM é diferente, curadoria de golden sets, armadilhas de LLM-as-judge (position/verbosity bias), frameworks modernos (Braintrust, Langfuse, Inspect, Promptfoo), A/B testing de prompt em produção, regression em agents. Capstone eval harness completo.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/llm-evals` },
  ...social({ titulo: `LLM Evals Profissional — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/llm-evals' }),
  title: 'LLM Evals Profissional',
  description: DESCRICAO_CARTAO,
  keywords:
    'llm evals, golden set llm, llm as judge, position bias verbosity, braintrust langfuse promptfoo inspect, ab test prompt, agent regression',
};

export default function LlmEvalsPage() {
  return <TrailBlogClient trail={trail} />;
}
