import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail31')!;

export const metadata: Metadata = {
  title: 'Frontend Moderno — HTML, CSS, JS e React — FFV Academy',
  description:
    'Frontend 2026 focado em fundamentos sólidos: HTML semântico (dialog, popover, invoker commands), CSS moderno (Grid, Subgrid, Container Queries, @layer, :has, View Transitions), JS ES2024+, React fiber e Server Components, Core Web Vitals e capstone com Next.js App Router.',
  keywords:
    'frontend moderno 2026, html semantico, css grid subgrid, container queries, css cascade layers, react server components, next.js app router, core web vitals inp',
};

export default function FrontendModernoPage() {
  return <TrailBlogClient trail={trail} />;
}
