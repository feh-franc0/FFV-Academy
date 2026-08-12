import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail27')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha SAP-C03 em PT-BR: multi-account com Organizations + Control Tower, networking avançado (Transit Gateway, RAM, Cloud WAN), migração 7 Rs com DMS, Well-Architected aplicado, DR, edge, analytics, security enterprise, cost optimization e capstone de simulado comentado.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/aws-sap-c03` },
  ...social({ titulo: `AWS Solutions Architect Professional (SAP-C03) — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/aws-sap-c03' }),
  title: 'AWS Solutions Architect Professional (SAP-C03)',
  description: DESCRICAO_CARTAO,
  keywords:
    'aws sap c03, solutions architect professional, aws organizations control tower, transit gateway, cloud wan, dms migration, well architected, disaster recovery aws, savings plans, guardduty security hub',
};

export default function AwsSapC03Page() {
  return <TrailBlogClient trail={trail} />;
}
