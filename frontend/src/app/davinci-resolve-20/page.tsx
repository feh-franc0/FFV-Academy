import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-cinema-davinci-resolve-20')!;

export const metadata: Metadata = {
  title: `${trail.name} — FFV Academy`,
  description: trail.desc,
  alternates: { canonical: `https://fernandofrancovalle.com/davinci-resolve-20` },
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
