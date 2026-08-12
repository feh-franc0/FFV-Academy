import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail-local-llms-edge')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'LLMs rodando localmente em 2026: quantização (GGUF/AWQ/GPTQ), llama.cpp internals, ollama production, vLLM PagedAttention, speculative decoding, MLX Apple Silicon, on-device mobile (ExecuTorch/MediaPipe), RAG 100% privado, hardware comparativo M3 Ultra vs RTX 5090 vs DGX.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/local-llms-edge` },
  ...social({ titulo: `Local LLMs & Edge AI — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/local-llms-edge' }),
  title: 'Local LLMs & Edge AI',
  description: DESCRICAO_CARTAO,
  keywords: 'llama.cpp, ollama, vllm pagedattention, mlx apple silicon, gguf awq gptq, rag local, m3 ultra llm, rtx 5090 ai',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
