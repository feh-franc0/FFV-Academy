import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'DevOps & Containers — Docker e Kubernetes — FFV Academy',
  description: 'Trilha completa de DevOps e Containers: Docker do zero ao production-ready e Kubernetes do Pod ao cluster de produção. Técnico, denso e didático.',
};

export default function DevOpsContainersPage() {
  return <TrailBlogClient trail={CURRICULUM[6]} />;
}
