import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('fundamentos')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Fundamentos Técnicos do FFV Academy: base real de computação, Linux/terminal, Git, SQL, HTTP, redes, TLS e como o computador funciona por dentro. Sem isso, IA e cloud viram cargo cult.',
  keywords:
    'fundamentos programacao, linux terminal, git de verdade, sql profundo, como computador funciona, redes tcp ip, http tls, base computacao',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
