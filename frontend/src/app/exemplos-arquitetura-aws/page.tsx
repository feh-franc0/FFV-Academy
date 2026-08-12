import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Cem laboratórios de arquitetura AWS reproduzíveis, do básico à solução com IA: aplicação .NET 8 em ECS Fargate com RDS em sub-rede privada e front na borda, provisionada em Terraform, e daí até serverless, distribuídos, segurança, operação, dados e IA generativa. Cada um com entregável verificável e três arquiteturas — mínima, produção e evolução.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/exemplos-arquitetura-aws` },
  ...social({
    titulo: '100 Laboratórios de Arquitetura AWS — FFV Academy',
    descricao: DESCRICAO_CARTAO,
    caminho: '/exemplos-arquitetura-aws',
  }),
  title: '100 Laboratórios de Arquitetura AWS',
  description: DESCRICAO_CARTAO,
};

export default function ExemplosArquiteturaAwsPage() {
  // `getTrailByHref` e não índice numérico: 11 páginas passaram a exibir a trilha
  // errada quando os índices deslizaram no pivot. Travado por `paginas-de-trilha`.
  const trail = getTrailByHref('/exemplos-arquitetura-aws');
  if (!trail) return null;
  return <TrailBlogClient trail={trail} />;
}
