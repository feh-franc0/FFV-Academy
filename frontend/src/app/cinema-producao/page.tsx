import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-cinema-producao')!;

export const metadata: Metadata = {
  title: `${trail.name} — FFV Academy`,
  description: trail.desc,
  alternates: { canonical: `https://fernandofrancovalle.com/cinema-producao` },
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
