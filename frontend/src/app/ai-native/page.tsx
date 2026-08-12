import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha de Engenharia AI-Native: RAG profissional, agent patterns, MCP, LLMOps, evaluation e context engineering. O que separa um protótipo de IA de um sistema em produção de verdade.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/ai-native` },
  ...social({ titulo: `Engenharia AI-Native — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/ai-native' }),
  title: 'Engenharia AI-Native',
  description: DESCRICAO_CARTAO,
  keywords:
    'engenharia ai-native, rag producao, agent patterns, mcp server, llmops, evaluation rag, context engineering, llm engineer',
};

export default function AINativePage() {
  const trail = getTrailByHref('/ai-native');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
