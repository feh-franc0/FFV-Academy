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
    estimatedWeeks: 56,
    stages: [
      {
        title: 'Stage 1 — Fundamentos',
        trailIds: ['trail12', 'trail16', 'trail14'],
        outcome: 'Domina terminal, Git, HTTP, SQL, rede — base inegociável.',
      },
      {
        title: 'Stage 2 — Linguagens',
        trailIds: ['trail19', 'trail36'],
        outcome: 'TypeScript profissional + Python pra IA.',
      },
      {
        title: 'Stage 3 — IA core',
        trailIds: ['trail1', 'trail2', 'trail9'],
        outcome: 'Fundamentos IA + além do LLM + engenharia AI-native (RAG, agents, MCP).',
      },
      {
        title: 'Stage 4 — IA na AWS',
        trailIds: ['trail-bedrock', 'trail-arq-ia-aws'],
        outcome: 'Bedrock ponta a ponta e as 100 arquiteturas — IA em produção sobre serviços AWS.',
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
    audience: 'Dev web que quer se certificar AWS até nível Professional (SAA-C03 + DVA + SAP).',
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
    title: 'Backend Dev → AI-Native Engineer',
    subtitle: 'Backend clássico consolidando dados + IA aplicada em produção.',
    audience: 'Dev backend Java/Python/Go que quer se mover pra AI-native engineering (2026).',
    color: '#a78bfa',
    emoji: '🌐',
    estimatedWeeks: 36,
    stages: [
      {
        title: 'Stage 1 — TypeScript profissional',
        trailIds: ['trail19'],
        outcome: 'TS sério — narrowing, generics, runtime validation.',
      },
      {
        title: 'Stage 2 — DB + data',
        trailIds: ['trail38', 'trail24'],
        outcome: 'Postgres internals + data engineering.',
      },
      {
        title: 'Stage 3 — IA aplicada',
        trailIds: ['trail1', 'trail2', 'trail9', 'trail-bedrock'],
        outcome: 'IA core + agents + Bedrock em produção.',
      },
      {
        title: 'Stage 4 — Security & qualidade',
        trailIds: ['trail22'],
        outcome: 'Security engineering pra sistemas de IA em produção.',
      },
    ],
  },
  {
    id: 'dev-arquiteto-ia-aws',
    title: 'Dev → Arquiteto de IA na AWS',
    subtitle: 'Da primeira chamada ao Bedrock à arquitetura de IA que sobrevive em produção.',
    audience: 'Dev que já entrega na AWS e quer desenhar solução de IA de ponta a ponta.',
    color: '#ff9900',
    emoji: '◈',
    estimatedWeeks: 22,
    stages: [
      {
        title: 'Stage 1 — Bedrock de ponta a ponta',
        trailIds: ['trail-bedrock'],
        outcome: 'Converse API, Knowledge Bases, agents e AgentCore, Guardrails, FinOps.',
      },
      {
        title: 'Stage 2 — Repertório de arquitetura',
        trailIds: ['trail-arq-ia-aws'],
        outcome: 'Cem arquiteturas percorríveis, cada uma com a decisão que ela ensina.',
      },
      {
        title: 'Stage 3 — Provar em laboratório',
        trailIds: ['trail-labs-aws'],
        outcome: 'Cem laboratórios em Terraform e .NET 8, do primeiro deploy à IA multirregional.',
      },
      {
        title: 'Stage 4 — Credencial e qualidade',
        trailIds: ['trail-aws-aif', 'trail26'],
        outcome: 'AIF-C01 e avaliação rigorosa — a prova externa e a prova interna.',
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
    estimatedWeeks: 30,
    stages: [
      { title: 'Stage 1 — Fundamentos de dados', trailIds: ['trail14', 'trail38'], outcome: 'SQL profundo + Postgres internals (MVCC, índices, query planner, replication).' },
      { title: 'Stage 2 — Data Engineering Moderna', trailIds: ['trail24'], outcome: 'Batch vs stream, dbt, orchestração, DuckDB/Polars, Iceberg, Kafka, CDC.' },
      { title: 'Stage 3 — NoSQL + Vector', trailIds: ['trail54'], outcome: 'NoSQL + Vector DBs polyglot — a fundação de retrieval pra IA.' },
      { title: 'Stage 4 — ML + MLOps', trailIds: ['trail50', 'trail51'], outcome: 'ML clássico + MLOps — preparado pra time AI-data híbrido.' },
    ],
  },
  {
    id: 'sre-incident-to-reliability',
    title: 'SRE: do incidente à resiliência',
    subtitle: 'SLOs, observabilidade e distribuídos em produção.',
    audience: 'Engineer que quer virar SRE sênior ou liderar incident response em produto crítico.',
    color: '#ef4444',
    emoji: '🔭',
    estimatedWeeks: 24,
    stages: [
      { title: 'Stage 1 — Base redes', trailIds: ['trail16'], outcome: 'Redes profundas (TCP, TLS, HTTP/2/3).' },
      { title: 'Stage 2 — Distribuídos + SRE', trailIds: ['trail10', 'trail11'], outcome: 'Consensus, sagas, consistency. SLOs, error budgets, OpenTelemetry, runbooks.' },
      { title: 'Stage 3 — Security', trailIds: ['trail22'], outcome: 'Security engineering pra operar produto crítico.' },
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
      { title: 'Stage 4 — Safety', trailIds: ['trail30'], outcome: 'AI Safety red teaming, constitutional AI, guardrails.' },
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
