import type { Metadata } from 'next';
import { RoadmapsClient } from './RoadmapsClient';

export const metadata: Metadata = {
  title: 'Roadmaps — FFV Academy',
  description:
    '5 jornadas curadas de longo prazo: Zero → Staff em IA, Dev Web → AWS Pro, Backend → Full-stack AI-Native, Claude Power → Harness Eng, Iniciante → Engenheiro Moderno. Trilhas inteiras em sequência orientada a objetivo.',
  alternates: { canonical: 'https://fernandofrancovalle.com/roadmaps' },
};

export default function RoadmapsPage() {
  return <RoadmapsClient />;
}
