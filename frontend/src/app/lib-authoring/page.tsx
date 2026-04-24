import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail42')!;

export const metadata: Metadata = {
  title: 'Library & Package Authoring — FFV Academy',
  description:
    'Publicar no npm como gente grande: tsup, ESM/CJS dual, types bons, changesets, semver disciplinado, tree-shaking, testes em libs, docs com Astro Starlight e política de deprecation. Da ideia ao pacote mantido por anos.',
  keywords:
    'publicar npm, tsup, esm cjs dual, changesets, semver, types library, tree shaking, library authoring, astro starlight, package maintenance',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
