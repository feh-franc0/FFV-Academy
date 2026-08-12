import type { Metadata } from 'next';
import { GlossaryClient } from './GlossaryClient';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Glossário técnico de IA, cloud, engenharia de software e sistemas distribuídos em português brasileiro.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/glossario` },
  ...social({ titulo: `Glossário — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/glossario' }),
  title: 'Glossário',
  description: DESCRICAO_CARTAO,
};

export default function GlossarioPage() {
  return <GlossaryClient />;
}
