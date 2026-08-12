import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha foundational: terminal Linux, Git profissional, HTTP, SSH, DNS/TLS, JSON/YAML — a base inegociável antes de AWS, Python ou qualquer outra trilha.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/fundamentos-tecnicos` },
  ...social({ titulo: `Fundamentos Técnicos — CLI, Git, HTTP, SSH — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/fundamentos-tecnicos' }),
  title: 'Fundamentos Técnicos — CLI, Git, HTTP, SSH',
  description: DESCRICAO_CARTAO,
};

export default function FundamentosTecnicosPage() {
  const trail = getTrailByHref('/fundamentos-tecnicos');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
