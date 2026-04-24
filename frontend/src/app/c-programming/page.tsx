import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail43')!;

export const metadata: Metadata = {
  title: 'C Moderno: Systems Programming — FFV Academy',
  description:
    'C como o OS em PT-BR: pointers e arrays sem mistério, memory management manual (malloc/free), undefined behavior reais, build systems (make, CMake, Ninja), debugging com gdb e Valgrind, threads (pthreads, C11), C moderno (C11/C23) e capstone de systems programming.',
  keywords:
    'c programming, c pointers, malloc free, undefined behavior, make cmake, gdb valgrind, pthreads, c11 c23, systems programming',
};

export default function CProgrammingPage() {
  return <TrailBlogClient trail={trail} />;
}
