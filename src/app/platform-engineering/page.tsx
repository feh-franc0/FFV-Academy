import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail59')!;

export const metadata: Metadata = {
  title: 'Platform Engineering & IDPs — FFV Academy',
  description:
    'Platform engineering real em PT-BR: IDPs, Backstage como catalog, golden paths, self-service infra (Crossplane/Pulumi/ArgoCD), platform as product, métricas DORA/SPACE. Distinto de DevOps.',
  keywords:
    'platform engineering, idp internal developer platform, backstage, golden path paved road, crossplane pulumi argocd, dora space metrics',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
