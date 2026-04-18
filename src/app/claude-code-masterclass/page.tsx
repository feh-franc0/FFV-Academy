import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Claude Code: do zero ao poder total — FFV Academy',
  description:
    'Trilha completa de Claude Code em PT-BR: instalação, CLAUDE.md, workflow diário, skills, subagents, hooks, MCP, integração com GitHub e Claude Cowork. Do terminal ao poder total.',
  keywords:
    'claude code tutorial, claude code primeiros passos, claude.md, claude code subagents, claude code hooks, claude code skills, mcp claude code, claude code github, claude cowork',
};

export default function ClaudeCodeMasterclassPage() {
  return <TrailBlogClient trail={CURRICULUM[11]} />;
}
