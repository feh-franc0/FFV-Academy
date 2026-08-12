import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail25')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Fine-tuning profissional em PT-BR: quando FT vs RAG vs prompt, SFT Supervised Fine-Tuning, LoRA/QLoRA e PEFT (fine-tune eficiente), DPO/RLHF simplificado, curadoria de datasets (dedup, contaminação), avaliação rigorosa, deploy (vLLM/TGI/Bedrock). Capstone modelo especialista de domínio.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/fine-tuning` },
  ...social({ titulo: `Fine-tuning & Customização de LLMs — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/fine-tuning' }),
  title: 'Fine-tuning & Customização de LLMs',
  description: DESCRICAO_CARTAO,
  keywords:
    'fine tuning llm, sft supervised, lora qlora peft, dpo rlhf, dataset curadoria, vllm tgi deploy, bedrock custom, llm especialista',
};

export default function FineTuningPage() {
  return <TrailBlogClient trail={trail} />;
}
