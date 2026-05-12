import type { Metadata } from 'next';
import { DevCardClient } from '@/components/DevCardClient';

export const metadata: Metadata = {
  title: 'Meu Dev Card — FFV Academy',
  description: 'Seu card de desenvolvedor com nível, XP, streak e conquistas. Compartilhe no LinkedIn.',
};

export default function Page() {
  return <DevCardClient />;
}
