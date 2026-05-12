import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-solo-saas')!;

export const metadata: Metadata = {
  title: 'Solo SaaS / Indie Hacker Stack 2026 — FFV Academy',
  description:
    'Engenharia de SaaS solo do dia 0 ao $10k MRR: Stripe billing patterns, multi-tenancy (pool/silo/hybrid), onboarding flows, churn analytics, métricas (CAC/LTV/MRR), pricing pages, email stack (Resend/Loops/Customer.io), suporte AI-first, LLC americana via Stripe Atlas, faturamento internacional como BR.',
  keywords: 'solo saas, indie hacker stack, stripe billing, multi tenant saas, churn mrr, ltv cac, llc americana brasileiro, stripe atlas, mercury banking',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
