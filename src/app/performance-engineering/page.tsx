import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail60')!;

export const metadata: Metadata = {
  title: 'Performance Engineering — FFV Academy',
  description:
    'Perf engineering como disciplina em PT-BR: flamegraphs, eBPF, profilers por linguagem (async-profiler, py-spy, pprof), cache analysis, lock contention, io_uring. Método científico.',
  keywords:
    'performance engineering, flamegraph, ebpf bcc bpftrace, async profiler java, py-spy python, pprof go, io_uring, cache analysis',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
