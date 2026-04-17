import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Claude & Anthropic na Prática — Claude Code, MCP, API, Hooks — FFV Academy',
  description: 'Trilha completa sobre o ecossistema Anthropic: Claude Code CLI, MCP servers, hooks, skills, API da Anthropic, prompt engineering e workflows profissionais com IA.',
};

export default function ClaudeAnthropicPage() {
  return <TrailBlogClient trail={CURRICULUM[12]} />;
}
