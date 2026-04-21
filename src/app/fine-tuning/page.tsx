import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail25')!;

export const metadata: Metadata = {
  title: 'Fine-tuning & Customização de LLMs — FFV Academy',
  description:
    'Fine-tuning profissional em PT-BR: quando FT vs RAG vs prompt, SFT Supervised Fine-Tuning, LoRA/QLoRA e PEFT (fine-tune eficiente), DPO/RLHF simplificado, curadoria de datasets (dedup, contaminação), avaliação rigorosa, deploy (vLLM/TGI/Bedrock). Capstone modelo especialista de domínio.',
  keywords:
    'fine tuning llm, sft supervised, lora qlora peft, dpo rlhf, dataset curadoria, vllm tgi deploy, bedrock custom, llm especialista',
};

export default function FineTuningPage() {
  return <TrailBlogClient trail={trail} />;
}
