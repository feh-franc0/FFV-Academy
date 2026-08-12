import type { Metadata } from 'next';
import { PlaylistsClient } from './PlaylistsClient';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Jornadas pré-montadas atravessando múltiplas trilhas: "Do zero à IA", "Já sei Python, quero IA", "DevOps → Cloud Architect", "Claude Code Pro" e mais.';

export const metadata: Metadata = {
  title: 'Playlists curadas',
  description: DESCRICAO_CARTAO,
  alternates: { canonical: `${BASE}/playlists` },
  ...social({ titulo: `Playlists curadas — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/playlists' }),
};

export default function PlaylistsPage() {
  return <PlaylistsClient />;
}
