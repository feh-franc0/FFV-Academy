import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-privacy-compliance')!;

export const metadata: Metadata = {
  title: 'Privacy & Compliance Engineering (LGPD/GDPR) — FFV Academy',
  description:
    'Trilha em PT-BR sobre privacy & compliance engineering: bases legais LGPD aplicadas no código, DPIA real, PII discovery, criptografia rest/transit, audit log imutável, right to erasure técnico, ANPD incident response 72h. 10 módulos do júnior ao DPO técnico.',
  keywords: 'lgpd engenheiro, privacy engineering, dpia ripd, anpd incidente 72h, pii discovery, criptografia lgpd, secret scanning, right to erasure',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
