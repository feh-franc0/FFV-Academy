import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail44')!;

export const metadata: Metadata = {
  title: 'C++ Moderno (C++20/23) — FFV Academy',
  description:
    'C++ moderno pragmático em PT-BR: RAII e smart pointers, move semantics, templates com Concepts, STL ranges, modules e coroutines, performance real (cache, SIMD, constexpr), Core Guidelines e sanitizers, capstone de utility high-performance.',
  keywords:
    'c++ moderno, c++20 c++23, raii smart pointers, move semantics, concepts, ranges, coroutines, modules, simd, core guidelines',
};

export default function CppModernoPage() {
  return <TrailBlogClient trail={trail} />;
}
