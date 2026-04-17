import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Redes & Web — TCP/IP, HTTP, TLS, DNS, CORS — FFV Academy',
  description: 'TCP/IP, HTTP/1-2-3, TLS 1.3, DNS, proxies, WebSocket, CORS e CSRF — o que acontece entre o teclado e a resposta, explicado de verdade.',
};

export default function RedesWebPage() {
  return <TrailBlogClient trail={CURRICULUM[15]} />;
}
