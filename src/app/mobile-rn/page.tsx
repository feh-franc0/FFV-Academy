import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail35')!;

export const metadata: Metadata = {
  title: 'Mobile para Devs Web (React Native + Expo) — FFV Academy',
  description:
    'Mobile sério para quem vem de React web: Expo SDK, navegação, gestos, notificações, OTA updates, EAS Build, deep links, testes e publicação nas stores. Sem framework-fadiga, com foco em entregar app real em produção.',
  keywords:
    'react native, expo sdk, expo router, eas build, mobile para dev web, react native production, deep link mobile, notificações push',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
