import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-ai-rlhf-agents')!;

export const metadata: Metadata = {
  title: 'AI Engineering Avançado: RLHF & Agents em Produção — FFV Academy',
  description:
    'A camada AI moderna além do prompt engineering: RLHF/PPO, RLAIF Constitutional AI da Anthropic, DPO/IPO/KTO, GRPO do DeepSeek-R1, reasoning models por dentro, agent swarms (CrewAI, AutoGen, LangGraph), observabilidade e evaluation de agentes em produção.',
  keywords: 'rlhf ppo, rlaif anthropic, dpo ipo kto, grpo deepseek, reasoning model o1, langgraph, crewai autogen, agent observability langsmith',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
