import type { Metadata } from 'next';
import { ProgressoClient } from '@/components/ProgressoClient';

export const metadata: Metadata = {
  title: 'Progresso — FFV Academy',
  description:
    'Seu dashboard completo: nível, XP, streak, badges, progresso por hub e por trilha. Todo o seu aprendizado em um só lugar.',
  keywords:
    'progresso ffv academy, dashboard aprendizado, xp nivel badge, streak estudos, progresso curso ia',
};

export default function Page() {
  return <ProgressoClient />;
}
