import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'IA Além do LLM — FFV Academy',
  description: 'KV Cache, Mixture of Experts, Tool Calling e arquitetura de agentes. Como os modelos funcionam em produção.',
};

export default function IaAlemDoLLMPage() {
  return <TrailBlogClient trail={CURRICULUM[1]} />;
}
