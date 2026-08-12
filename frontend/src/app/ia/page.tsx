import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const hub = getHubBySlug('ia')!;

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/ia` },
  // O cartão usa `tagline` do hub: frase curta feita para caber em cartão,
  // enquanto `description` acima é a longa, para a meta tag.
  ...social({ titulo: `${hub.name} — FFV Academy`, descricao: hub.tagline, caminho: hub.href }),
  // Sem sufixo: o template `'%s — FFV Academy'` do layout raiz o aplica. Escrever
  // à mão aqui produzia `<title>X — FFV Academy — FFV Academy</title>`.
  title: hub.name,
  description:
    'O conhecimento de IA que sustenta uma arquitetura na AWS: como o LLM funciona por dentro, RAG e chunking, padrões agênticos, evals, fine-tuning, safety, multimodal e ML clássico.',
  keywords:
    'fundamentos de ia, como funciona um llm, rag chunking embeddings, padroes agenticos, evals de llm, fine-tuning vs rag, ai safety, transformers',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
