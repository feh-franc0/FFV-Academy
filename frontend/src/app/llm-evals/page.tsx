import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail26')!;

export const metadata: Metadata = {
  title: 'LLM Evals Profissional — FFV Academy',
  description:
    'Evals como disciplina em PT-BR: por que testar LLM é diferente, curadoria de golden sets, armadilhas de LLM-as-judge (position/verbosity bias), frameworks modernos (Braintrust, Langfuse, Inspect, Promptfoo), A/B testing de prompt em produção, regression em agents. Capstone eval harness completo.',
  keywords:
    'llm evals, golden set llm, llm as judge, position bias verbosity, braintrust langfuse promptfoo inspect, ab test prompt, agent regression',
};

export default function LlmEvalsPage() {
  return <TrailBlogClient trail={trail} />;
}
