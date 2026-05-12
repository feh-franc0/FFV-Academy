import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Deploy Full Stack: VPS, Docker e CI/CD — FFV Academy',
  description:
    'Trilha completa de deploy: provisiona uma VPS, configura Docker Compose com réplicas, Nginx como proxy reverso, SSL automático via Let\'s Encrypt, CI/CD com GitHub Actions e deploy do frontend estático. Do zero ao MVP em produção.',
};

export default function DeployFullStackVpsPage() {
  const trail = CURRICULUM.find(t => t.id === 'trail-deploy-fullstack')!;
  return <TrailBlogClient trail={trail} />;
}
