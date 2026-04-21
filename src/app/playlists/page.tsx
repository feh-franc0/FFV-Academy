import type { Metadata } from 'next';
import { PlaylistsClient } from './PlaylistsClient';

export const metadata: Metadata = {
  title: 'Playlists curadas — FFV Academy',
  description: 'Jornadas pré-montadas atravessando múltiplas trilhas: "Do zero à IA", "Já sei Python, quero IA", "DevOps → Cloud Architect", "Claude Code Pro" e mais.',
  alternates: { canonical: 'https://fernandofrancovalle.com/playlists' },
};

export default function PlaylistsPage() {
  return <PlaylistsClient />;
}
