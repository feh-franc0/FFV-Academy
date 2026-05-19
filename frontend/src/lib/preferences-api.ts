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

// ─── Fase 3 (PERSONALIZATION_PLAN_2026-05.md) ────────────────────────────
// Campos novos pra modelar a plataforma ao perfil de aprendizado.
// Convivem com os campos legados (hub/cert/objective) — frontend escolhe.

export type FrequencyKindServer = 'daily' | 'weekly' | 'specific_days';

export interface FrequencyDTOServer {
  kind: FrequencyKindServer;
  daysPerWeek?: number;
  weekdays?: number[];
}

export type MaterialKindServer = 'video' | 'text' | 'quiz' | 'srs' | 'cheatsheet';

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
  // Fase 3 — campos novos. Opcionais pra compat com backend antigo.
  interestedBases?: string[];
  homeBase?: string;
  learningGoals?: string;
  topicTags?: string[];
  frequency?: FrequencyDTOServer;
  preferredMaterials?: MaterialKindServer[];
}

export interface UpdatePreferencesInput {
  hubIds?: string[];
  trailIds?: string[];
  certificationIds?: string[];
  objectives?: Objective[];
  skillLevel?: SkillLevel;
  dailyQuestionEnabled?: boolean;
  // Fase 3
  interestedBases?: string[];
  homeBase?: string;
  learningGoals?: string;
  topicTags?: string[];
  frequency?: FrequencyDTOServer;
  preferredMaterials?: MaterialKindServer[];
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

// ─── Mappers UserPreferences (Fase 3) ↔ Preferences (server) ────────────
// useUserPreferences hook usa esses pra hidratar do server e enviar updates.

import type { UserPreferences, StudyFrequency, MaterialKind } from './user-preferences';

/**
 * Converte Preferences (server DTO) pra UserPreferences (shape do client).
 * Defaults seguros pra campos ausentes (backend antigo sem Fase 3).
 */
export function serverToUserPreferences(p: Preferences): UserPreferences {
  const freq: StudyFrequency = p.frequency
    ? p.frequency.kind === 'daily'
      ? { kind: 'daily' }
      : p.frequency.kind === 'weekly'
        ? { kind: 'weekly', daysPerWeek: p.frequency.daysPerWeek ?? 3 }
        : { kind: 'specific_days', weekdays: p.frequency.weekdays ?? [] }
    : { kind: 'weekly', daysPerWeek: 3 };

  return {
    interestedBases: p.interestedBases ?? [],
    homeBase: p.homeBase || null,
    learningGoals: p.learningGoals ?? '',
    topicTags: p.topicTags ?? [],
    frequency: freq,
    preferredMaterials: (p.preferredMaterials ?? []) as MaterialKind[],
    updatedAt: p.updatedAt,
  };
}

/** Converte UserPreferences (client) pra UpdatePreferencesInput (server PUT body). */
export function userPreferencesToUpdateInput(p: UserPreferences): UpdatePreferencesInput {
  const freq: FrequencyDTOServer =
    p.frequency.kind === 'daily'
      ? { kind: 'daily' }
      : p.frequency.kind === 'weekly'
        ? { kind: 'weekly', daysPerWeek: p.frequency.daysPerWeek }
        : { kind: 'specific_days', weekdays: p.frequency.weekdays };

  return {
    interestedBases: p.interestedBases,
    homeBase: p.homeBase ?? '',
    learningGoals: p.learningGoals,
    topicTags: p.topicTags,
    frequency: freq,
    preferredMaterials: p.preferredMaterials as MaterialKindServer[],
  };
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
  { id: 'ia',                   label: 'Inteligência Artificial', icon: '🧠', description: 'Transformers, LLMs, RAG, agents, fine-tuning' },
  { id: 'aws',                  label: 'AWS',                     icon: '☁️', description: 'EC2, S3, Lambda, certificações Cloud Practitioner/Developer' },
  { id: 'engenharia',           label: 'Engenharia de Software',  icon: '⚙️', description: 'Arquitetura, sistemas distribuídos, SRE, testing' },
  { id: 'claude',               label: 'Claude & Anthropic',      icon: '🪶', description: 'Claude Code, MCP, context engineering, safety' },
  { id: 'fundamentos',          label: 'Fundamentos',             icon: '📐', description: 'CS, redes, banco de dados, algoritmos' },
  { id: 'programacao',          label: 'Programação',             icon: '💻', description: 'TypeScript, Go, Python, frameworks' },
  { id: 'dados',                label: 'Dados',                   icon: '📊', description: 'ETL, data warehouse, analytics, ML ops' },
  { id: 'profissional-digital', label: 'Profissional Digital',    icon: '🚀', description: 'Carreira, comunicação, conteúdo, empreendedorismo' },
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
