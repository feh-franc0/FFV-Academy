import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'TCP/IP, HTTP/1-2-3, TLS 1.3, DNS, proxies, WebSocket, CORS e CSRF — o que acontece entre o teclado e a resposta, explicado de verdade.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/redes-web` },
  ...social({ titulo: `Redes & Web — TCP/IP, HTTP, TLS, DNS, CORS — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/redes-web' }),
  title: 'Redes & Web — TCP/IP, HTTP, TLS, DNS, CORS',
  description: DESCRICAO_CARTAO,
};

export default function RedesWebPage() {
  const trail = getTrailByHref('/redes-web');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
