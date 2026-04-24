import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('aws')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub AWS do FFV Academy: trilha Cloud Practitioner (CLF-C02) para nivelamento profissional e Solutions Architect Associate (SAA-C03) para arquitetura de soluções resilientes, seguras e otimizadas em custo.',
  keywords:
    'aws cloud practitioner, aws saa-c03, certificacao aws, clf-c02, solutions architect associate, aws arquitetura, trilha aws',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
