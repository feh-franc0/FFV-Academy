import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const hub = getHubBySlug('engenharia')!;

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/engenharia` },
  // O cartão usa `tagline` do hub: frase curta feita para caber em cartão,
  // enquanto `description` acima é a longa, para a meta tag.
  ...social({ titulo: `${hub.name} — FFV Academy`, descricao: hub.tagline, caminho: hub.href }),
  // Sem sufixo: o template `'%s — FFV Academy'` do layout raiz o aplica. Escrever
  // à mão aqui produzia `<title>X — FFV Academy — FFV Academy</title>`.
  title: hub.name,
  description:
    'O que sustenta uma solução de IA depois do deploy: MLOps, observabilidade e SRE, sistemas distribuídos, FinOps, segurança, e a camada de dados que alimenta o retrieval de todo RAG.',
  keywords:
    'mlops, observabilidade sre, sistemas distribuidos, finops nuvem, security engineering, system design, postgres internals, vector database, data engineering',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
