/**
 * Base de Tecnologia — adaptadores que convertem CURRICULUM/HUBS/PLAYLISTS
 * para os shapes compartilhados (HubCardData, PlaylistCardData, ComecarPath)
 * que o KnowledgeBaseHome consome.
 *
 * /tecnologia/page.tsx importa daqui e renderiza o KnowledgeBaseHome com
 * essas adapters — mesma estrutura visual que a /medicina-veterinaria usa.
 */

import { CURRICULUM, HUBS, getHubStats } from '@/lib/curriculum';
import { PLAYLISTS } from '@/lib/playlists';
import type { HubCardData, PlaylistCardData } from '@/components/home/Explorar';
import type { ComecarPath } from '@/components/home/ComecarAqui';

export const TECH_TOTAL_MODULES = CURRICULUM.flatMap(t => t.modules).length;
export const TECH_TOTAL_TRAILS = CURRICULUM.length;
export const TECH_TOTAL_HUBS = HUBS.length;

export const TECH_HUBS: HubCardData[] = HUBS.map(hub => {
  const stats = getHubStats(hub);
  return {
    id: hub.id,
    name: hub.name,
    icon: hub.icon,
    color: hub.color,
    tagline: hub.tagline,
    href: hub.href,
    trailCount: stats.trailCount,
    moduleCount: stats.moduleCount,
  };
});

export const TECH_PLAYLISTS: PlaylistCardData[] = PLAYLISTS.slice(0, 8).map(p => ({
  id: p.id,
  title: p.title,
  subtitle: p.subtitle,
  emoji: p.emoji,
  color: p.color,
  moduleCount: p.moduleSlugs.length,
  href: '/playlists',
}));

export const TECH_PATHS: ComecarPath[] = [
  {
    icon: '🌱',
    title: 'Nunca estudei IA',
    desc: 'Comece pelos fundamentos — do conceito de IA até Transformers.',
    href: '/fundamentos-da-ia',
    cta: 'Começar do zero',
    color: '#58a6ff',
  },
  {
    icon: '⚡',
    title: 'Já sei o básico',
    desc: 'Pule direto para KV Cache, MoE e Tool Calling em produção.',
    href: '/ia-alem-do-llm',
    cta: 'IA Além do LLM',
    color: '#d2a8ff',
  },
  {
    icon: '🔧',
    title: 'Quero codar com IA',
    desc: 'Claude Code, Cursor, Codex — qual usar e quando.',
    href: '/ferramentas-ia-codigo',
    cta: 'Coding Agents',
    color: '#ffa657',
  },
  {
    icon: '☁️',
    title: 'Quero certificação AWS',
    desc: 'Cloud Practitioner, Developer e Solutions Architect.',
    href: '/aws-cloud-practitioner',
    cta: 'AWS Cloud',
    color: '#ff9900',
  },
  {
    icon: '🏗️',
    title: 'Quero virar sênior',
    desc: 'DevOps, distribuídos, observabilidade — engenheiro de sistemas.',
    href: '/engenharia',
    cta: 'Engenharia',
    color: '#e3b341',
  },
  {
    icon: '🎤',
    title: 'Quero crescer no digital',
    desc: 'Comunicação, carreira, conteúdo, marketing, empreendedorismo.',
    href: '/aprenda/comunicacao-falar-em-publico',
    cta: 'Profissional Digital',
    color: '#f472b6',
  },
];
