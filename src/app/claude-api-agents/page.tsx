import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'API Claude & Agents — Anthropic API, MCP, RAG, Agents — FFV Academy',
  description:
    'Trilha de API Claude & Agents em PT-BR: messages API, streaming, tool use, prompt evaluation, MCP fundamentos e avançado, RAG com Claude, arquitetura de agents e workflows em produção.',
  keywords:
    'anthropic api tutorial, claude tool use, mcp fundamentos, mcp avancado, rag com claude, claude agents, prompt evaluation, workflows ia producao',
};

export default function ClaudeApiAgentsPage() {
  return <TrailBlogClient trail={CURRICULUM[12]} />;
}
