/**
 * Roadmaps curados — jornadas de longo prazo atravessando trilhas inteiras.
 *
 * Upgrade das playlists: playlists são módulos selecionados; roadmaps são
 * TRILHAS inteiras em sequência orientada a objetivo de carreira.
 */

import { CURRICULUM, type Trail } from './curriculum';

export interface RoadmapStage {
  title: string;
  trailIds: string[];
  /** O que esperar depois dessa etapa. */
  outcome: string;
}

export interface Roadmap {
  id: string;
  title: string;
  subtitle: string;
  audience: string;
  color: string;
  emoji: string;
  /** Duração estimada em semanas (~10h/semana). */
  estimatedWeeks: number;
  stages: RoadmapStage[];
}

export const ROADMAPS: Roadmap[] = [
  {
    id: 'zero-staff-ia',
    title: 'Zero → Staff Engineer em IA',
    subtitle: 'Do básico de programação ao topo da carreira técnica em IA.',
    audience: 'Dev iniciante-intermediário que quer se tornar Staff Engineer em IA em 12-18 meses.',
    color: '#58a6ff',
    emoji: '🚀',
    estimatedWeeks: 60,
    stages: [
      {
        title: 'Stage 1 — Fundamentos',
        trailIds: ['trail12', 'trail15', 'trail16', 'trail14'],
        outcome: 'Domina terminal, Git, HTTP, SQL, rede — base inegociável.',
      },
      {
        title: 'Stage 2 — Programação & DS&A',
        trailIds: ['trail19', 'trail20', 'trail36'],
        outcome: 'TypeScript profissional + algoritmos pragmáticos + Python pra IA.',
      },
      {
        title: 'Stage 3 — IA core',
        trailIds: ['trail1', 'trail2', 'trail9'],
        outcome: 'Fundamentos IA + além do LLM + engenharia AI-native (RAG, agents, MCP).',
      },
      {
        title: 'Stage 4 — Claude & produção',
        trailIds: ['trail13', 'trail17', 'trail18'],
        outcome: 'Domínio do ecosystem Anthropic: Code, API, Harness Engineering.',
      },
      {
        title: 'Stage 5 — Avançado + Evals',
        trailIds: ['trail25', 'trail26', 'trail22'],
        outcome: 'Fine-tuning próprio, LLM evals rigoroso, security engineering.',
      },
    ],
  },
  {
    id: 'dev-web-aws-pro',
    title: 'Dev Web → AWS Solutions Architect Pro',
    subtitle: 'Da primeira Lambda ao certificado Professional.',
    audience: 'Dev web que quer se certificar AWS até nível Professional (SAA-C03 + DVA + futuro SAP).',
    color: '#f78166',
    emoji: '☁️',
    estimatedWeeks: 32,
    stages: [
      {
        title: 'Stage 1 — Cloud Practitioner',
        trailIds: ['trail4'],
        outcome: 'Fundamentos AWS, passa CLF-C02.',
      },
      {
        title: 'Stage 2 — Developer Associate',
        trailIds: ['trail23'],
        outcome: 'Lambda profundo, DynamoDB, API GW, IaC — DVA-C02 approved.',
      },
      {
        title: 'Stage 3 — Solutions Architect Associate',
        trailIds: ['trail5'],
        outcome: 'Arquitetura resiliente, segura, otimizada — SAA-C03 approved.',
      },
      {
        title: 'Stage 4 — Fundamentos pra SAP',
        trailIds: ['trail10', 'trail11', 'trail22'],
        outcome: 'Sistemas distribuídos + SRE + security pra base SAP-C03.',
      },
    ],
  },
  {
    id: 'fullstack-ai-native',
    title: 'Backend Dev → Full-stack AI-Native',
    subtitle: 'Backend clássico aprendendo frontend moderno + IA aplicada.',
    audience: 'Dev backend Java/Python/Go que quer se mover pra full-stack AI-native (2026).',
    color: '#a78bfa',
    emoji: '🌐',
    estimatedWeeks: 40,
    stages: [
      {
        title: 'Stage 1 — TypeScript profissional',
        trailIds: ['trail19', 'trail21'],
        outcome: 'TS sério + API Design moderno.',
      },
      {
        title: 'Stage 2 — DB + data',
        trailIds: ['trail38', 'trail24'],
        outcome: 'Postgres internals + data engineering.',
      },
      {
        title: 'Stage 3 — IA aplicada',
        trailIds: ['trail1', 'trail2', 'trail9', 'trail17'],
        outcome: 'IA core + agents + Claude API em produção.',
      },
      {
        title: 'Stage 4 — Testing + A11y + Security',
        trailIds: ['trail33', 'trail34', 'trail22'],
        outcome: 'Qualidade profissional — testing, a11y, security.',
      },
    ],
  },
  {
    id: 'claude-power-harness',
    title: 'Claude Power User → Harness Engineer',
    subtitle: 'De usar Claude Code até construir harnesses customizados pro time.',
    audience: 'Dev que já usa Claude Code e quer dominar SDK, hooks, plugins e Agent SDK.',
    color: '#cc785c',
    emoji: '⊕',
    estimatedWeeks: 20,
    stages: [
      {
        title: 'Stage 1 — Claude Code Masterclass',
        trailIds: ['trail13'],
        outcome: 'Skills, subagents, hooks, MCP, multi-projeto.',
      },
      {
        title: 'Stage 2 — API & Agents',
        trailIds: ['trail17'],
        outcome: 'Messages API, tool use, MCP avançado, RAG.',
      },
      {
        title: 'Stage 3 — Harness Engineering',
        trailIds: ['trail18'],
        outcome: 'System prompt engineering, plugins, Agent SDK em produção.',
      },
      {
        title: 'Stage 4 — LLM Evals & Safety',
        trailIds: ['trail26'],
        outcome: 'Avaliação rigorosa de agents em produção.',
      },
    ],
  },
  {
    id: 'iniciante-engenheiro-moderno',
    title: 'Iniciante → Engenheiro de Software Moderno',
    subtitle: 'Do zero ao engenheiro que sabe Docker, K8s, distribuídos e SRE.',
    audience: 'Quem está começando na área ou vindo de outra stack e quer base moderna.',
    color: '#3fb950',
    emoji: '🏗️',
    estimatedWeeks: 48,
    stages: [
      {
        title: 'Stage 1 — Fundamentos',
        trailIds: ['trail12', 'trail15', 'trail14', 'trail16'],
        outcome: 'Terminal, Git, SQL, como computador e rede funcionam.',
      },
      {
        title: 'Stage 2 — TypeScript + API Design',
        trailIds: ['trail19', 'trail21', 'trail20'],
        outcome: 'Código profissional + APIs bem desenhadas + DS&A.',
      },
      {
        title: 'Stage 3 — DevOps & Distribuídos',
        trailIds: ['trail7', 'trail8', 'trail10', 'trail11'],
        outcome: 'Docker, K8s, arquitetura moderna, distribuídos, SRE.',
      },
      {
        title: 'Stage 4 — Security + Testing + DB Deep',
        trailIds: ['trail22', 'trail33', 'trail38'],
        outcome: 'Security engineering, testing engineering, Postgres internals.',
      },
    ],
  },
  {
    id: 'data-engineer-staff',
    title: 'Data Engineer → Staff',
    subtitle: 'Do SQL ao pipeline de dados AI-ready.',
    audience: 'Dev/analyst que quer dominar a camada de dados moderna (lakehouse, stream, ML).',
    color: '#10b981',
    emoji: '🏭',
    estimatedWeeks: 32,
    stages: [
      { title: 'Stage 1 — Fundamentos de dados', trailIds: ['trail14', 'trail38'], outcome: 'SQL profundo + Postgres internals (MVCC, índices, query planner, replication).' },
      { title: 'Stage 2 — Data Engineering Moderna', trailIds: ['trail24'], outcome: 'Batch vs stream, dbt, orchestração, DuckDB/Polars, Iceberg, Kafka, CDC.' },
      { title: 'Stage 3 — Streaming + NoSQL', trailIds: ['trail62', 'trail54'], outcome: 'Kafka depth (EOS, schema registry, CDC Debezium). NoSQL + Vector DBs polyglot.' },
      { title: 'Stage 4 — ML + MLOps', trailIds: ['trail50', 'trail51'], outcome: 'ML clássico + MLOps — preparado pra time AI-data híbrido.' },
    ],
  },
  {
    id: 'platform-engineer',
    title: 'Platform Engineer',
    subtitle: 'IDPs, golden paths e developer experience em escala.',
    audience: 'SRE/DevOps sênior que quer virar Platform Engineer em empresa com 100+ devs.',
    color: '#f97316',
    emoji: '🏗️',
    estimatedWeeks: 36,
    stages: [
      { title: 'Stage 1 — DevOps sólido', trailIds: ['trail7', 'trail8'], outcome: 'Docker + K8s + CI/CD + engenharia moderna.' },
      { title: 'Stage 2 — Distribuídos + Observabilidade', trailIds: ['trail10', 'trail11'], outcome: 'CAP/Raft/sagas + OpenTelemetry + SLOs + incident response.' },
      { title: 'Stage 3 — Platform Engineering', trailIds: ['trail59', 'trail40'], outcome: 'Backstage IDP, golden paths, paved road, DORA/SPACE, DX Productivity.' },
      { title: 'Stage 4 — Edge + Chaos + Perf', trailIds: ['trail37', 'trail66', 'trail60'], outcome: 'Edge computing, chaos engineering, performance engineering como disciplina.' },
    ],
  },
  {
    id: 'sre-incident-to-reliability',
    title: 'SRE: do incidente à resiliência',
    subtitle: 'SLOs, chaos e observabilidade profissional.',
    audience: 'Engineer que quer virar SRE sênior ou liderar incident response em produto crítico.',
    color: '#ef4444',
    emoji: '🔭',
    estimatedWeeks: 28,
    stages: [
      { title: 'Stage 1 — Base sistemas', trailIds: ['trail15', 'trail16'], outcome: 'Como computador funciona + redes profundas (TCP, TLS, HTTP/2/3).' },
      { title: 'Stage 2 — Distribuídos + SRE', trailIds: ['trail10', 'trail11'], outcome: 'Consensus, sagas, consistency. SLOs, error budgets, OpenTelemetry, runbooks.' },
      { title: 'Stage 3 — Chaos + Security', trailIds: ['trail66', 'trail22', 'trail61'], outcome: 'Chaos engineering, security eng, cripto aplicada (mTLS, zero-trust).' },
      { title: 'Stage 4 — Performance + Career', trailIds: ['trail60', 'trail65'], outcome: 'Perf engineering cross-lang + Career (promo, resume, negotiation).' },
    ],
  },
  {
    id: 'ai-safety-researcher',
    title: 'AI Safety & Alignment Engineer',
    subtitle: 'Red teaming, evals e alinhamento em produção.',
    audience: 'Engineer ou researcher que quer atuar em time de safety de labs ou produto com AI crítico.',
    color: '#dc2626',
    emoji: '🛡️',
    estimatedWeeks: 30,
    stages: [
      { title: 'Stage 1 — Fundamentos IA', trailIds: ['trail1', 'trail2'], outcome: 'Como IA aprende, transformers, arquiteturas além do LLM.' },
      { title: 'Stage 2 — Agents + Evals', trailIds: ['trail9', 'trail26'], outcome: 'Engenharia AI-native + LLM Evals profissional (golden sets, LLM-as-judge, regression).' },
      { title: 'Stage 3 — Fine-tune + Multimodal', trailIds: ['trail25', 'trail29'], outcome: 'SFT/LoRA/DPO + voice/vision/multimodal — entender modelo por dentro.' },
      { title: 'Stage 4 — Safety + Crypto', trailIds: ['trail30', 'trail61'], outcome: 'AI Safety red teaming, constitutional AI, cripto aplicada (privacy-preserving).' },
    ],
  },
];

export interface ResolvedStage extends RoadmapStage {
  trails: Trail[];
}

export function resolveRoadmap(roadmap: Roadmap): ResolvedStage[] {
  return roadmap.stages.map(stage => ({
    ...stage,
    trails: stage.trailIds
      .map(id => CURRICULUM.find(t => t.id === id))
      .filter((t): t is Trail => !!t),
  }));
}

export function getRoadmap(id: string): Roadmap | undefined {
  return ROADMAPS.find(r => r.id === id);
}
