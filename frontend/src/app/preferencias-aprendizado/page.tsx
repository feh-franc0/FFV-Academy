import type { Metadata } from 'next';
import { PreferenciasAprendizadoClient } from './PreferenciasAprendizadoClient';

export const metadata: Metadata = {
  title: 'Preferências de aprendizado',
  description: 'Personalize os hubs, certificações e objetivos para receber recomendações de trilhas e simulados alinhados ao seu plano de estudo.',
  robots: 'noindex, nofollow',
};

export default function PreferenciasAprendizadoPage() {
  return <PreferenciasAprendizadoClient />;
}
