import type { Metadata } from 'next';
import { GlossaryClient } from './GlossaryClient';

export const metadata: Metadata = {
  title: 'Glossário — FFV Academy',
  description: 'Glossário técnico de IA, cloud, engenharia de software e sistemas distribuídos em português brasileiro.',
};

export default function GlossarioPage() {
  return <GlossaryClient />;
}
