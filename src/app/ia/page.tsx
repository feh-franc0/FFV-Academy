import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('ia')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Inteligência Artificial do FFV Academy: trilhas de Fundamentos da IA, IA Além do LLM (KV cache, MoE, tool calling) e Ferramentas de IA para Código. Conteúdo técnico, research-backed, gamificado.',
  keywords:
    'aprender inteligencia artificial, trilha IA, fundamentos IA, LLM avancado, coding agents, machine learning, transformers, agentes IA',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
