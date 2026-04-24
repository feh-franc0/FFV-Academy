import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail34')!;

export const metadata: Metadata = {
  title: 'Acessibilidade & Inclusive Engineering — FFV Academy',
  description:
    'Accessibility como disciplina em PT-BR: WCAG 2.2/3, POUR, EU Accessibility Act 2025, semantic HTML, ARIA (quando e quando não), keyboard navigation + focus management, screen readers (NVDA/VoiceOver) na prática, automated testing com axe-core, capstone de remediação AA.',
  keywords:
    'accessibility wcag, a11y, pour, eu accessibility act, semantic html, aria rule, keyboard focus, nvda voiceover, axe-core lighthouse, wcag aa compliance',
};

export default function AcessibilidadePage() {
  return <TrailBlogClient trail={trail} />;
}
