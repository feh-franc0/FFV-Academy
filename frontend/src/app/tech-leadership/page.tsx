import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail32')!;

export const metadata: Metadata = {
  title: 'Tech Leadership & Staff Engineering — FFV Academy',
  description:
    'Tech leadership em PT-BR: ADRs pra decisões reversíveis vs irreversíveis, mentoria como multiplicador, code review pedagógico, estimativas sem mentir (Hofstadter + cone of uncertainty), lidar com legacy via Chesterton Fence e strangler fig, carreira IC vs gestão, capstone de ADR completo.',
  keywords:
    'tech leadership, staff engineer, principal engineer, adr architecture decision record, mentoria tecnica, code review pedagogico, estimativas software, legacy code strangler fig, carreira ic vs manager',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
