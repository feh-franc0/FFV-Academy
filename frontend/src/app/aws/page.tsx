import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const hub = getHubBySlug('aws')!;

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/aws` },
  // O cartão usa `tagline` do hub: frase curta feita para caber em cartão,
  // enquanto `description` acima é a longa, para a meta tag.
  ...social({ titulo: `${hub.name} — FFV Academy`, descricao: hub.tagline, caminho: hub.href }),
  // Sem sufixo: o template `'%s — FFV Academy'` do layout raiz o aplica. Escrever
  // à mão aqui produzia `<title>X — FFV Academy — FFV Academy</title>`.
  title: hub.name,
  description:
    'Arquitetura de soluções AWS na prática: 100 laboratórios reproduzíveis em Terraform e .NET 8, do primeiro deploy à arquitetura de IA multirregional, mais as certificações CLF-C02, DVA-C02, SAA-C03 e SAP-C03.',
  keywords:
    'arquitetura de solucoes aws, laboratorio aws terraform, aws bem arquitetado, well-architected, aws cloud practitioner, aws saa-c03, sap-c03, dva-c02, clf-c02',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
