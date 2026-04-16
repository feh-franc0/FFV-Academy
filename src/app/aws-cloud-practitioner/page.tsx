import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'AWS Cloud Practitioner (CLF-C02) — FFV Academy',
  description: 'Trilha completa para a certificação AWS Certified Cloud Practitioner (CLF-C02). Cobre 100% dos 4 domínios oficiais: Cloud Concepts, Security, Technology e Billing — com comparações, decision boxes e simulado comentado.',
};

export default function AwsCloudPractitionerPage() {
  return <TrailBlogClient trail={CURRICULUM[3]} />;
}
