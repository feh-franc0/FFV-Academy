import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('conteudo')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Criação de Conteúdo: estratégia editorial, gravação áudio+vídeo, edição, publicação multi-plataforma (YouTube, LinkedIn, X, Instagram), métricas e monetização.',
  keywords:
    'criacao de conteudo, youtube, linkedin, gravacao, edicao, audiencia, monetizacao, personal brand, dev content',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
