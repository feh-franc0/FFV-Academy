import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-local-llms-edge')!;

export const metadata: Metadata = {
  title: 'Local LLMs & Edge AI — FFV Academy',
  description:
    'LLMs rodando localmente em 2026: quantização (GGUF/AWQ/GPTQ), llama.cpp internals, ollama production, vLLM PagedAttention, speculative decoding, MLX Apple Silicon, on-device mobile (ExecuTorch/MediaPipe), RAG 100% privado, hardware comparativo M3 Ultra vs RTX 5090 vs DGX.',
  keywords: 'llama.cpp, ollama, vllm pagedattention, mlx apple silicon, gguf awq gptq, rag local, m3 ultra llm, rtx 5090 ai',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
