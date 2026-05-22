import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('profissional-digital')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub do Profissional Digital Completo: comunicação humana, carreira digital BR, criação de conteúdo, marketing digital, empreendedorismo, inglês para brasileiros e solo-SaaS. As habilidades humanas que a IA não substitui.',
  keywords:
    'comunicacao humana, carreira digital, criacao de conteudo, marketing digital, empreendedorismo digital, ingles para devs, solo saas, profissional digital',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
