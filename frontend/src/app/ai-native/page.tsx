import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Engenharia AI-Native — FFV Academy',
  description:
    'Trilha de Engenharia AI-Native: RAG profissional, agent patterns, MCP, LLMOps, evaluation e context engineering. O que separa um protótipo de IA de um sistema em produção de verdade.',
  keywords:
    'engenharia ai-native, rag producao, agent patterns, mcp server, llmops, evaluation rag, context engineering, llm engineer',
};

export default function AINativePage() {
  return <TrailBlogClient trail={CURRICULUM[7]} />;
}
