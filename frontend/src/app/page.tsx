import type { Metadata } from 'next';
import { LandingClient } from '@/components/LandingClient';

export const metadata: Metadata = {
  title: 'FFV Academy — Sua base de estudo personalizada no mesmo dia',
  description:
    'Envie o que precisa estudar e nossa IA + curadoria criam, no mesmo dia, uma base completa de aprendizado — com trilhas, módulos, questões e revisão espaçada. Igual à base de Tecnologia, mas pra sua matéria.',
};

export default function HomePage() {
  return <LandingClient />;
}
