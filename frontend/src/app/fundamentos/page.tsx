import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const hub = getHubBySlug('fundamentos')!;

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/fundamentos` },
  // O cartão usa `tagline` do hub: frase curta feita para caber em cartão,
  // enquanto `description` acima é a longa, para a meta tag.
  ...social({ titulo: `${hub.name} — FFV Academy`, descricao: hub.tagline, caminho: hub.href }),
  // Sem sufixo: o template `'%s — FFV Academy'` do layout raiz o aplica. Escrever
  // à mão aqui produzia `<title>X — FFV Academy — FFV Academy</title>`.
  title: hub.name,
  description:
    'A base de quem vai construir na AWS: Linux e terminal, Git, SQL, HTTP, redes e TLS, mais as linguagens do stack — Python, TypeScript e Go. Sem isso, IA e cloud viram cargo cult.',
  keywords:
    'fundamentos programacao, linux terminal, git de verdade, sql profundo, redes tcp ip, http tls, python para engenheiros, typescript profissional, go profissional',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
