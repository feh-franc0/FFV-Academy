import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('engenharia')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Engenharia de Software do FFV Academy: trilhas de DevOps & Containers (Docker, Kubernetes, CI/CD profissional) e Engenharia de Software Moderna (SDD, agents, testes, segurança, arquitetura).',
  keywords:
    'engenharia de software, devops, docker, kubernetes, ci cd, arquitetura de software, spec driven development, agents ia, testes profissionais',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
