import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Claude Code Pro: Harness Engineering — FFV Academy',
  description:
    'Trilha avançada de Claude Code em PT-BR: system prompt engineering, output styles, permissions em produção, skills avançadas com scripts, hooks cookbook executável, plugins para o time, Agent SDK em CI/CD. O nível depois de dominar o Claude Code.',
  keywords:
    'claude code pro, harness engineering, system prompt claude, output styles, claude code plugins, claude agent sdk producao, hooks cookbook claude, skills avancado claude',
};

export default function ClaudeCodeProPage() {
  return <TrailBlogClient trail={CURRICULUM[CURRICULUM.length - 1]} />;
}
