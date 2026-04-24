import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail49')!;

export const metadata: Metadata = {
  title: 'Rust Profissional — FFV Academy',
  description:
    'Rust sério em PT-BR: ownership/borrow como mental model, lifetimes sem medo, traits e generics idiomáticos, async com tokio, macros, unsafe com FFI, cargo/crates. História (Mozilla → Foundation) e evolução por edição até 2024/2026. Por que virou padrão de infra AI.',
  keywords:
    'rust profissional, rust 2026, ownership borrow checker, rust tokio axum, rust macros, rust ffi pyo3, rust edition 2024, rust ai infra',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
