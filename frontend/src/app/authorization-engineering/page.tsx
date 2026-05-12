import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-authorization')!;

export const metadata: Metadata = {
  title: 'Authorization Engineering: RBAC → ABAC → ReBAC — FFV Academy',
  description:
    'Autorização além do "if user.role == admin": RBAC NIST clássico, ABAC com policies sobre atributos, Google Zanzibar paper (USENIX 2019), SpiceDB, OpenFGA (CNCF), OPA/Rego, AWS Cedar, multi-tenant authorization patterns para SaaS B2B.',
  keywords: 'rbac abac rebac, google zanzibar, spicedb authzed, openfga cncf, opa rego, aws cedar, multi-tenant authorization saas',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
