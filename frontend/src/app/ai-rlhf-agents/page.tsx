import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail-ai-rlhf-agents')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'A camada AI moderna além do prompt engineering: RLHF/PPO, RLAIF Constitutional AI da Anthropic, DPO/IPO/KTO, GRPO do DeepSeek-R1, reasoning models por dentro, agent swarms (CrewAI, AutoGen, LangGraph), observabilidade e evaluation de agentes em produção.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/ai-rlhf-agents` },
  ...social({ titulo: `AI Engineering Avançado: RLHF & Agents em Produção — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/ai-rlhf-agents' }),
  title: 'AI Engineering Avançado: RLHF & Agents em Produção',
  description: DESCRICAO_CARTAO,
  keywords: 'rlhf ppo, rlaif anthropic, dpo ipo kto, grpo deepseek, reasoning model o1, langgraph, crewai autogen, agent observability langsmith',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
