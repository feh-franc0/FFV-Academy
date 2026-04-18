import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Engenharia de Software Moderna — FFV Academy',
  description:
    'Trilha de Engenharia de Software Moderna: SDD, gerenciamento e criação de agents, testes profissionais, segurança real e arquitetura. Como deixar de ser coder e virar engenheiro de verdade.',
};

export default function EngenhariaSoftwarePage() {
  return <TrailBlogClient trail={CURRICULUM[6]} />;
}
