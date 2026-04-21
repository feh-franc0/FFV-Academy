import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('construcao')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub Construção & Clientes do FFV Academy: frontend moderno (HTML/CSS/JS/React), mobile para devs web (React Native + Expo), Edge Computing & Workers e Library Authoring (npm, tsup, changesets). A camada que toca o usuário final, feita por gente que entende engenharia — sem framework-fadiga.',
  keywords:
    'frontend moderno, react profissional, mobile react native expo, edge computing cloudflare workers, publicar npm, tsup changesets, library authoring',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
