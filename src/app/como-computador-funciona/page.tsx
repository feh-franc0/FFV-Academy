import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Como o Computador Funciona — CPU, memória, processos, I/O — FFV Academy',
  description: 'CPU pipeline, cache, memória virtual, syscalls, file descriptors, I/O bloqueante vs epoll, containers via namespaces — o modelo mental que faz tudo fazer sentido.',
};

export default function ComoComputadorFuncionaPage() {
  return <TrailBlogClient trail={CURRICULUM[14]} />;
}
