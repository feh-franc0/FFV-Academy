import type { Metadata } from 'next';
import { HomeClient } from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'FFV Academy — Aprenda IA do Zero ao Avançado',
  description: 'Trilha de aprendizado gamificada sobre Inteligência Artificial. XP, badges e progresso visual. 100% gratuito.',
};

export default function HomePage() {
  return <HomeClient />;
}
