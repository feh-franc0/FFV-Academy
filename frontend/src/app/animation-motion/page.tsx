import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-animation-motion')!;

export const metadata: Metadata = {
  title: 'Animation & Motion Engineering — FFV Academy',
  description:
    'Motion sério em 2026: Framer Motion v12, GSAP profissional (gratuito), CSS animations avançadas, View Transitions API, scroll-driven animations, FLIP technique, motion choreography, performance + A11y (prefers-reduced-motion).',
  keywords: 'framer motion v12, gsap, view transitions api, scroll-driven animation, flip technique, motion choreography, prefers reduced motion',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
