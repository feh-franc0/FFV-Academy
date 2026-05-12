import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-design-systems')!;

export const metadata: Metadata = {
  title: 'Design Systems Engineering — FFV Academy',
  description:
    'Design Systems como engenharia de verdade: design tokens W3C, theming + dark mode automático, Radix/Ark headless primitives, Tailwind v4 plugins, Storybook 9 + Chromatic, semantic versioning de DS, A11y completo, pipeline Figma → código com MCP.',
  keywords: 'design systems engineering, design tokens w3c, radix ui, ark ui, tailwind v4, storybook 9, chromatic, mcp figma, ds versioning',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
