import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail30')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Segurança de IA como disciplina em PT-BR: taxonomia de jailbreaks e prompt injection, data exfiltration via tools em agents, Constitutional AI da Anthropic, guardrails (NeMo, Llama Guard, Claude), red team playbook com PyRIT e capstone de red team do próprio agent.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/ai-safety` },
  ...social({ titulo: `AI Safety, Red Teaming & Alinhamento — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/ai-safety' }),
  title: 'AI Safety, Red Teaming & Alinhamento',
  description: DESCRICAO_CARTAO,
  keywords:
    'ai safety, prompt injection, jailbreak llm, constitutional ai, rlaif, nemo guardrails, llama guard, pyrit, red team llm, agent security',
};

export default function AiSafetyPage() {
  return <TrailBlogClient trail={trail} />;
}
