/**
 * Playlists curadas — jornadas pré-montadas atravessando múltiplas trilhas.
 *
 * Cada playlist agrupa módulos específicos pra um perfil ("já sei Python, quero IA",
 * "DevOps → Cloud Architect"). Não substitui trilhas; complementa com um recorte
 * orientado a objetivo.
 */

import { CURRICULUM, type Module, type Trail } from './curriculum';

export interface Playlist {
  id: string;
  title: string;
  subtitle: string;
  audience: string;
  color: string;
  emoji: string;
  /** Slugs de módulos, em ordem recomendada de consumo. */
  moduleSlugs: string[];
}

export const PLAYLISTS: Playlist[] = [
  {
    id: 'do-zero-a-ia',
    title: 'Do zero à IA',
    subtitle: 'Entenda IA como quem vai usar pra engenharia.',
    audience: 'Nunca mexeu com IA e quer o básico técnico real.',
    color: '#58a6ff',
    emoji: '🚀',
    moduleSlugs: [
      'o-que-e-ia',
      'dados-o-combustivel',
      'como-ia-aprende',
      'redes-neurais',
      'o-que-e-llm',
      'tokens',
      'transformers',
      'tool-calling',
    ],
  },
  {
    id: 'ja-sei-python-quero-ia',
    title: 'Já sei Python, quero IA',
    subtitle: 'Da programação à engenharia de sistemas de IA.',
    audience: 'Dev Python que quer sair de "uso API" pra "desenho agentes".',
    color: '#a371f7',
    emoji: '🧠',
    moduleSlugs: [
      'o-que-e-llm',
      'tool-calling',
      'rag-fundamentos',
      'chunking-embeddings',
      'agentes-padroes',
      'mcp-servers',
      'llm-apis-producao',
      'llmops-drift-canary',
    ],
  },
  {
    id: 'devops-cloud-architect',
    title: 'DevOps → Cloud Architect',
    subtitle: 'Do container à arquitetura SAA-C03.',
    audience: 'Dev/DevOps que quer virar arquiteto de soluções AWS.',
    color: '#f78166',
    emoji: '☁️',
    moduleSlugs: [
      'docker-completo',
      'kubernetes-completo',
      'vpc-avancado',
      'containers-ecs-eks',
      'rds-aurora-dynamodb',
      'caching-performance',
      'disaster-recovery',
      'cost-optimization-saa',
    ],
  },
  {
    id: 'claude-code-pro',
    title: 'Claude Code Pro',
    subtitle: 'Dominar o harness do começo até SDK e plugins.',
    audience: 'Dev sênior que já usa Claude Code e quer próximo nível.',
    color: '#c9a66b',
    emoji: '⊕',
    moduleSlugs: [
      'claude-code-arquitetura',
      'claude-code-permissoes',
      'claude-code-skills-commands',
      'claude-code-subagents',
      'claude-code-hooks',
      'claude-code-mcp-na-pratica',
      'claude-code-sdk',
      'harness-anatomia-do-agente',
    ],
  },
  {
    id: 'engenharia-moderna',
    title: 'Engenharia moderna ponta a ponta',
    subtitle: 'Arquitetura, testes, sistemas distribuídos e SRE.',
    audience: 'Dev que quer consolidar base sênior de engenharia.',
    color: '#3fb950',
    emoji: '🏗️',
    moduleSlugs: [
      'arquitetura-software-moderna',
      'testes-profissionais',
      'cap-pacelc',
      'idempotencia-retries',
      'observability-pilares',
      'slos-error-budgets',
      'incident-response-postmortem',
    ],
  },
  {
    id: 'primeiros-90-dias-dev',
    title: 'Primeiros 90 dias como dev',
    subtitle: 'O que dominar no trimestre que define sua carreira.',
    audience: 'Dev júnior ou em transição que quer acelerar onboarding.',
    color: '#f59e0b',
    emoji: '🚀',
    moduleSlugs: [
      'linux-terminal-basico',
      'git-de-verdade',
      'github-fluxo-profissional',
      'http-do-zero',
      'select-join-na-pratica',
      'engenheiro-vs-coder',
      'code-review-pedagogico',
      'testes-profissionais',
      'career-mental-model-sr-staff',
    ],
  },
  {
    id: 'de-junior-a-pleno',
    title: 'De júnior a pleno',
    subtitle: 'A ponte que as pessoas travam em 2 anos por não planejar.',
    audience: 'Dev júnior com 1-2 anos buscando progressão formal.',
    color: '#eab308',
    emoji: '📈',
    moduleSlugs: [
      'engenheiro-vs-coder',
      'arquitetura-software-moderna',
      'test-pyramid-realista',
      'observability-pilares',
      'owasp-top-10-com-exemplo-em-codigo',
      'tw-design-docs',
      'behavioral-interview-prep',
      'promo-docs-brag-doc',
    ],
  },
  {
    id: 'ia-para-dev-backend',
    title: 'IA para devs backend',
    subtitle: 'Do LLM na API ao RAG em produção sem magia.',
    audience: 'Dev backend que quer entregar features com IA sem virar pesquisador.',
    color: '#58a6ff',
    emoji: '🧠',
    moduleSlugs: [
      'o-que-e-llm',
      'tokens',
      'prompt-engineering-claude',
      'claude-tool-use',
      'rag-fundamentos',
      'chunking-embeddings',
      'vector-dbs-pgvector-pinecone',
      'eval-frameworks',
      'llmops-drift-canary',
    ],
  },
  {
    id: 'kubernetes-zero-prod',
    title: 'Kubernetes: zero → produção',
    subtitle: 'O mínimo pra não ser o cara que só faz kubectl apply.',
    audience: 'DevOps/Platform que precisa operar K8s com responsabilidade.',
    color: '#326ce5',
    emoji: '☸️',
    moduleSlugs: [
      'docker-completo',
      'kubernetes-completo',
      'github-actions-cicd',
      'secrets-management',
      'observability-pilares',
      'metricas-red-use',
      'chaos-eng-principios',
      'dora-space-metricas',
    ],
  },
  {
    id: 'staff-engineer-path',
    title: 'Staff Engineer path',
    subtitle: 'Escrita técnica, system design, impacto cross-team.',
    audience: 'Sênior que quer subir pra Staff de verdade, não hierarquia.',
    color: '#8b5cf6',
    emoji: '🧭',
    moduleSlugs: [
      'tw-design-docs',
      'tw-rfcs-como-escrever',
      'tw-adrs-na-pratica',
      'sd-framework-completo',
      'sd-back-of-envelope',
      'platform-as-product',
      'mentoria-tecnica',
      'promo-docs-brag-doc',
    ],
  },
];

export interface ResolvedPlaylistModule extends Module {
  trailName: string;
  trailColor: string;
  trailHref?: string;
}

/** Resolve uma playlist em módulos reais do currículo (drop slugs não encontrados). */
export function resolvePlaylist(playlist: Playlist): ResolvedPlaylistModule[] {
  const out: ResolvedPlaylistModule[] = [];
  for (const slug of playlist.moduleSlugs) {
    let found: { mod: Module; trail: Trail } | null = null;
    for (const trail of CURRICULUM) {
      const mod = trail.modules.find(m => m.slug === slug);
      if (mod) { found = { mod, trail }; break; }
    }
    if (!found) continue;
    out.push({
      ...found.mod,
      trailName: found.trail.name,
      trailColor: found.trail.color,
      trailHref: found.trail.href,
    });
  }
  return out;
}

export function getPlaylist(id: string): Playlist | undefined {
  return PLAYLISTS.find(p => p.id === id);
}
