import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('claude-anthropic')!;

export const metadata: Metadata = {
  title: 'Claude & Anthropic — Claude Code, API, MCP, Agents — FFV Academy',
  description:
    'Hub Claude & Anthropic do FFV Academy: duas trilhas completas sobre o ecossistema Anthropic. Claude Code do zero ao poder total e API & Agents — o melhor conteúdo em PT-BR sobre a Anthropic.',
  keywords:
    'claude code tutorial, anthropic api, mcp model context protocol, claude agents, subagents claude, prompt engineering claude, claude brasil',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
