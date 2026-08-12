import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const hub = getHubBySlug('ia-aws')!;

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/ia-aws` },
  // O cartão usa `tagline` do hub: frase curta feita para caber em cartão,
  // enquanto `description` acima é a longa, para a meta tag.
  ...social({ titulo: `${hub.name} — FFV Academy`, descricao: hub.tagline, caminho: hub.href }),
  // Sem sufixo: o template `'%s — FFV Academy'` do layout raiz o aplica. Escrever
  // à mão aqui produzia `<title>X — FFV Academy — FFV Academy</title>`.
  title: hub.name,
  description:
    'Hub central da FFV: soluções de IA em produção sobre AWS. Amazon Bedrock ponta a ponta, Knowledge Bases, Agents e AgentCore, Guardrails, 100 arquiteturas de IA e a certificação AIF-C01.',
  keywords:
    'ia na aws, amazon bedrock, bedrock knowledge bases, bedrock agents, agentcore, guardrails bedrock, arquitetura de ia aws, aif-c01, rag na aws',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
