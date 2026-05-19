/**
 * UserPreferences (frontend-only V1) — localStorage-backed.
 *
 * Versão V1 dessas preferências roda 100% client-side (mock backend).
 * V2 (PR3 do PERSONALIZATION_PLAN.md) plugará em GET/PUT
 * /api/v1/me/preferences mantendo o mesmo shape.
 *
 * Não é parte do `GameState` (que tem schema migration estrita); é uma
 * camada separada de "perfil de aprendizado". Isso evita bump de schema
 * v4 do GameState toda vez que adicionamos campo aqui.
 */

import { z } from 'zod';

export type StudyFrequency =
  | { kind: 'daily' }
  | { kind: 'weekly'; daysPerWeek: number }
  | { kind: 'specific_days'; weekdays: number[] };

export type MaterialKind = 'video' | 'text' | 'quiz' | 'srs' | 'cheatsheet';

export interface UserPreferences {
  /** Slugs das bases que interessam (multi-select). */
  interestedBases: string[];
  /** Slug da base "home" — redireciona pra ela do /. null = sem preferência. */
  homeBase: string | null;
  /** Objetivo livre do aluno, ≤280 chars. */
  learningGoals: string;
  /** Tags de tópico — usado pra ranker personalizar hubs. */
  topicTags: string[];
  /** Ritmo de estudo declarado. */
  frequency: StudyFrequency;
  /** Tipos de material preferidos. */
  preferredMaterials: MaterialKind[];
  /** ISO timestamp da última edição (controle de drift do schema). */
  updatedAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  interestedBases: [],
  homeBase: null,
  learningGoals: '',
  topicTags: [],
  frequency: { kind: 'weekly', daysPerWeek: 3 },
  preferredMaterials: ['text', 'quiz'],
  updatedAt: new Date(0).toISOString(),
};

const STORAGE_KEY = 'ffv_user_preferences_v1';

const FrequencySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('daily') }),
  z.object({ kind: z.literal('weekly'), daysPerWeek: z.number().int().min(1).max(7) }),
  z.object({
    kind: z.literal('specific_days'),
    weekdays: z.array(z.number().int().min(0).max(6)).max(7),
  }),
]);

const MaterialKindSchema = z.enum(['video', 'text', 'quiz', 'srs', 'cheatsheet']);

const PreferencesSchema = z.object({
  interestedBases: z.array(z.string()).max(50),
  homeBase: z.string().nullable(),
  learningGoals: z.string().max(280),
  topicTags: z.array(z.string()).max(50),
  frequency: FrequencySchema,
  preferredMaterials: z.array(MaterialKindSchema).max(5),
  updatedAt: z.string(),
});

export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = PreferencesSchema.parse(JSON.parse(raw));
    return parsed;
  } catch {
    // Schema drift / corrupted — volta pro default e remove
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    const next = { ...prefs, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage cheio / safari modo privado — silenciamos
  }
}

/**
 * Retorna quantos "sinais" o usuário CUSTOMIZOU (0 a 4) — usado pelo
 * banner "Sinais desbloqueados: X/4 — quanto mais a gente te conhece,
 * melhor a recomendação." (motivacional, não bloqueante).
 *
 * Conta só intent customizado, NÃO default. Os 4 sinais:
 *  1. Marcou pelo menos uma base de interesse
 *  2. Escolheu base "home"
 *  3. Escreveu metas (≥5 chars)
 *  4. Ajustou frequência (qualquer valor diferente do default weekly:3)
 *
 * Materiais ficam de fora porque o default já vem com 2 selecionados
 * (text + quiz) — contar isso inflaria o gauge artificialmente.
 */
export function countSignals(prefs: UserPreferences): number {
  let n = 0;
  if (prefs.interestedBases.length > 0) n++;
  if (prefs.homeBase) n++;
  if (prefs.learningGoals.trim().length >= 5) n++;
  // Frequência customizada = diferente do default weekly:3
  const isDefaultFreq =
    prefs.frequency.kind === 'weekly' && prefs.frequency.daysPerWeek === 3;
  if (!isDefaultFreq) n++;
  return n;
}
