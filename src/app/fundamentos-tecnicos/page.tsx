import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Fundamentos Técnicos — CLI, Git, HTTP, SSH — FFV Academy',
  description: 'Trilha foundational: terminal Linux, Git profissional, HTTP, SSH, DNS/TLS, JSON/YAML — a base inegociável antes de AWS, Python ou qualquer outra trilha.',
};

export default function FundamentosTecnicosPage() {
  return <TrailBlogClient trail={CURRICULUM[11]} />;
}
