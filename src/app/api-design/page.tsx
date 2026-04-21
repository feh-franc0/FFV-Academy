import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail21')!;

export const metadata: Metadata = {
  title: 'API Design & Contratos — FFV Academy',
  description:
    'Trilha profissional de design de API em PT-BR: REST maduro (Richardson, idempotência), versionamento, GraphQL com DataLoader, gRPC + Protobuf, OpenAPI como contrato vivo, paginação cursor, idempotency keys e webhooks, rate limiting. Da amadora ao padrão produção.',
  keywords:
    'api design profissional, rest maduro richardson, versionamento api, graphql dataloader, grpc protobuf, openapi spec driven, cursor pagination, idempotency key, rate limiting api',
};

export default function ApiDesignPage() {
  return <TrailBlogClient trail={trail} />;
}
