import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail64')!;

export const metadata: Metadata = {
  title: 'Product Engineering & Experimentation — FFV Academy',
  description:
    'Engineering que pensa como produto em PT-BR: feature flags (GrowthBook/Unleash), A/B testing rigoroso, CUPED variance reduction, guardrails, product analytics (PostHog/Mixpanel). Decisão por dado.',
  keywords:
    'product engineering, feature flags growthbook unleash, ab testing estatistico, cuped variance reduction, guardrails experiment, posthog mixpanel amplitude',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
