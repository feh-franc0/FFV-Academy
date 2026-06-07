import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-end-to-end-web')!;

export const metadata: Metadata = {
  title: `${trail.name} — FFV Academy`,
  description: trail.desc,
  alternates: { canonical: `https://fernandofrancovalle.com/end-to-end-web` },
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
