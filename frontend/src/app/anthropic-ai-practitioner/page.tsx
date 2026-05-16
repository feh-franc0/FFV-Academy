import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Anthropic AI Practitioner — FFV Academy',
  description: 'Trilha focada em dominar Claude, prompt caching, context engineering, tool use e safety evals — preparação para a certificação Anthropic AI Practitioner.',
};

export default function AnthropicAiPractitionerPage() {
  const trail = CURRICULUM.find(t => t.id === 'trail-anthropic-ai');
  if (!trail) return null;
  return <TrailBlogClient trail={trail} />;
}
