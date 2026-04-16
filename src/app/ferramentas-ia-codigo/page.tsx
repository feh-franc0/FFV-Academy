import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Ferramentas de IA para Código — FFV Academy',
  description: 'Claude Code, Codex, Cursor, GitHub Copilot, Amazon Q e Kiro. As diferenças reais entre os coding agents — técnica, arquitetura, filosofia.',
};

export default function FerramentasIaCodigoPage() {
  return <TrailBlogClient trail={CURRICULUM[2]} />;
}
