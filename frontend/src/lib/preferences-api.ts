/**
 * Cliente HTTP do backend de preferências pedagógicas do usuário.
 *
 * Endpoints (todos requerem JWT):
 *   - GET  /api/v1/me/preferences → estado atual (default vazio se 1ª vez)
 *   - PUT  /api/v1/me/preferences → upsert + marca onboarded no 1º preenchimento
 *
 * A camada UI consome via React Query / useEffect e renderiza condicionalmente:
 *   - onboarded=false → mostra OnboardingWizard bloqueante
 *   - onboarded=true  → mostra DailyQuestionCard filtrado pelas certifications
 */

import { apiFetch } from './api-client';

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number] | '';

export const OBJECTIVES = ['certifications', 'career_growth', 'hobby', 'career_switch'] as const;
export type Objective = (typeof OBJECTIVES)[number];

export interface Preferences {
  hubIds: string[];
  trailIds: string[];
  certificationIds: string[];
  objectives: Objective[];
  skillLevel: SkillLevel;
  dailyQuestionEnabled: boolean;
  onboarded: boolean;
  onboardedAt?: string;
  updatedAt: string;
}

export interface UpdatePreferencesInput {
  hubIds?: string[];
  trailIds?: string[];
  certificationIds?: string[];
  objectives?: Objective[];
  skillLevel?: SkillLevel;
  dailyQuestionEnabled?: boolean;
}

/** Lê as preferências do user logado. Backend retorna default vazio se ainda não persistido. */
export async function fetchPreferences(): Promise<Preferences> {
  return apiFetch<Preferences>('/api/v1/me/preferences', {}, true);
}

/** Atualiza preferências (upsert). Marca onboarded automaticamente no 1º preenchimento substantivo. */
export async function updatePreferences(input: UpdatePreferencesInput): Promise<Preferences> {
  return apiFetch<Preferences>(
    '/api/v1/me/preferences',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    true,
  );
}

// ─── Catálogos UI ─────────────────────────────────────────────────────────
// Listas estáticas usadas no Wizard e tela /preferencias-aprendizado.
// IDs alinhados com curriculum.ts e simulados-catalog.ts.

export interface HubOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const HUB_OPTIONS: readonly HubOption[] = [
  { id: 'ia-aws',               label: 'IA na AWS',               icon: '◈', description: 'Bedrock, Knowledge Bases, agents, AgentCore, Guardrails' },
  { id: 'aws',                  label: 'Arquitetura AWS',         icon: '☁️', description: '100 laboratórios em Terraform, CLF, DVA, SAA e SAP' },
  { id: 'ia',                   label: 'Fundamentos de IA',       icon: '🧠', description: 'Transformers, LLMs, RAG, agents, evals, fine-tuning' },
  { id: 'engenharia',           label: 'Produção e Dados',        icon: '⚙️', description: 'SRE, distribuídos, FinOps, segurança, retrieval' },
  { id: 'fundamentos',          label: 'Base técnica',            icon: '📐', description: 'Terminal, Git, HTTP, redes, SQL, Python/TS/Go' },
] as const;

export interface CertificationOption {
  id: string;
  label: string;
  provider: string;
}

export const CERTIFICATION_OPTIONS: readonly CertificationOption[] = [
  { id: 'aws-clf',      label: 'AWS Cloud Practitioner (CLF-C02)', provider: 'AWS' },
  { id: 'aws-dva',      label: 'AWS Developer Associate (DVA-C02)', provider: 'AWS' },
  { id: 'aws-saa',      label: 'AWS Solutions Architect Associate (SAA-C03)', provider: 'AWS' },
  { id: 'aws-aif',      label: 'AWS AI Practitioner (AIF-C01)', provider: 'AWS' },
  { id: 'anthropic-ai', label: 'Anthropic AI Practitioner', provider: 'Anthropic' },
] as const;

export interface ObjectiveOption {
  id: Objective;
  label: string;
  description: string;
  icon: string;
}

export const OBJECTIVE_OPTIONS: readonly ObjectiveOption[] = [
  { id: 'certifications', label: 'Passar em certificações', description: 'Foco em provas oficiais e simulados', icon: '🎯' },
  { id: 'career_growth',  label: 'Evoluir profissionalmente', description: 'Aprender pra crescer no trabalho atual', icon: '📈' },
  { id: 'hobby',          label: 'Curiosidade técnica',       description: 'Estudar por prazer e curiosidade', icon: '🧪' },
  { id: 'career_switch',  label: 'Trocar de área',             description: 'Migrar pra tech ou pra outro stack', icon: '🚪' },
] as const;

export interface SkillLevelOption {
  id: Exclude<SkillLevel, ''>;
  label: string;
  description: string;
}

export const SKILL_LEVEL_OPTIONS: readonly SkillLevelOption[] = [
  { id: 'beginner',     label: 'Iniciante',     description: 'Estou começando — quero o básico antes do avançado' },
  { id: 'intermediate', label: 'Intermediário', description: 'Já tenho experiência — busco aprofundar' },
  { id: 'advanced',     label: 'Avançado',      description: 'Sênior na área — quero conteúdo de fronteira' },
] as const;
