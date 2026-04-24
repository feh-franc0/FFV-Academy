import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail30')!;

export const metadata: Metadata = {
  title: 'AI Safety, Red Teaming & Alinhamento — FFV Academy',
  description:
    'Segurança de IA como disciplina em PT-BR: taxonomia de jailbreaks e prompt injection, data exfiltration via tools em agents, Constitutional AI da Anthropic, guardrails (NeMo, Llama Guard, Claude), red team playbook com PyRIT e capstone de red team do próprio agent.',
  keywords:
    'ai safety, prompt injection, jailbreak llm, constitutional ai, rlaif, nemo guardrails, llama guard, pyrit, red team llm, agent security',
};

export default function AiSafetyPage() {
  return <TrailBlogClient trail={trail} />;
}
