/**
 * Schemas Zod para validação em boundaries (import/export, URLs, localStorage hidratação).
 *
 * Use sempre que dados chegarem de fonte não-confiável:
 * - JSON importado pelo usuário (importState)
 * - Parâmetros de URL (?ref=...)
 * - localStorage "legacy" de outra versão
 *
 * Dados vindos do próprio código (CURRICULUM, BADGES_DEF, etc.) NÃO precisam de Zod.
 */

import { z } from 'zod';

export const ReviewCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  trailColor: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correct: z.number().int().nonnegative(),
  explanation: z.string(),
  easeFactor: z.number(),
  interval: z.number().nonnegative(),
  repetition: z.number().int().nonnegative(),
  dueDate: z.string(),
  lastReview: z.string().nullable(),
});

export const StudyDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data inválida (YYYY-MM-DD)'),
  minutes: z.number().nonnegative(),
  xpEarned: z.number(),
  cardsReviewed: z.number().int().nonnegative(),
  modulesCompleted: z.number().int().nonnegative(),
});

export const QuizScoreSchema = z.object({
  score: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  perfect: z.boolean(),
});

export const LastArticleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  icon: z.string(),
  trailName: z.string(),
  trailColor: z.string(),
  readTime: z.number().nonnegative(),
  xp: z.number().nonnegative(),
  href: z.string(),
  at: z.string(),
  progress: z.number().min(0).max(1),
});

/**
 * Schema canônico de GameState — validação estrita em importação.
 * Campos opcionais/desconhecidos são tolerados (strip); campos presentes
 * com tipo errado causam rejeição (fail-closed).
 */
export const GameStateSchema = z.object({
  schemaVersion: z.number().int().nonnegative().optional(),
  xp: z.number().nonnegative(),
  level: z.number().int().min(1),
  streak: z.number().int().nonnegative(),
  lastStudyDate: z.string().nullable(),
  completedModules: z.array(z.string()),
  quizScores: z.record(z.string(), QuizScoreSchema),
  badges: z.array(z.string()),
  totalStudyTime: z.number().nonnegative(),
  startedAt: z.string().nullable(),
  reviewCards: z.array(ReviewCardSchema),
  archivedCards: z.array(ReviewCardSchema),
  studyDays: z.array(StudyDaySchema),
  freezes: z.number().int().min(0).max(10),
  dailyGoal: z.number().int().positive(),
  lastReviewDate: z.string().nullable(),
  lastArticle: LastArticleSchema.nullable(),
  preferredHub: z.string().nullable(),
  onboardedAt: z.string().nullable(),
  articleProgress: z.record(z.string(), z.number().min(0).max(1)),
  perfectQuizStreak: z.number().int().nonnegative().optional(),
  earlyMorningDays: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  trailStartedAt: z.record(z.string(), z.string()).optional(),
  /** Metadata adicionada pelo exportState — ignorada na importação. */
  exportedAt: z.string().optional(),
}).strict();

export const ReferralRecordSchema = z.object({
  refId: z.string().regex(/^[a-z0-9]{3,32}$/),
  receivedAt: z.string(),
  bonusGranted: z.boolean(),
});

export const DailyModuleStoredSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slug: z.string().regex(/^[a-z0-9-]{1,100}$/),
});

// ─────────────────────────────────────────────────────────────────
// Auth / User profile
// ─────────────────────────────────────────────────────────────────

/** Email RFC-lite — suficiente pra UI, validação real fica no backend. */
export const emailSchema = z
  .string()
  .min(5)
  .max(254)
  .regex(/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/, 'email inválido');

/**
 * Telefone BR normalizado — aceita "+5511987654321" ou "5511987654321"
 * (DDI 55 obrigatório, DDD 2 dígitos + 8 ou 9 dígitos do número).
 * O LoginModal normaliza o input via normalizePhone() antes de validar,
 * portanto o valor chegará sempre com +55.
 */
export const phoneBRSchema = z
  .string()
  .regex(/^\+?55\d{10,11}$/, 'telefone BR inválido (formato: +55DDDNNNNNNNN)');

export const UserProfileSchema = z.object({
  name: z.string().min(1).max(120),
  email: emailSchema,
  // Permite string vazia para usuários migrados ou cadastrados sem telefone.
  phone: phoneBRSchema.or(z.literal('')),
  createdAt: z.string(),
  marketingConsent: z.boolean(),
  paidProducts: z.array(z.string().regex(/^[a-z0-9-]{1,80}$/)),
}).strict();

// ─────────────────────────────────────────────────────────────────
// Simulados
// ─────────────────────────────────────────────────────────────────

export const SimuladoAttemptSchema = z.object({
  simuladoId: z.string().regex(/^[a-z0-9-]{1,80}$/),
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  answers: z.record(z.string(), z.string().regex(/^[A-E]$/)),
  score: z.number().min(0).max(100).optional(),
  passed: z.boolean().optional(),
  reviewFlags: z.array(z.string()).optional(),
}).strict();

export const SimuladoAttemptsStoredSchema = z.record(z.string(), SimuladoAttemptSchema);

export const SimuladoTimerSchema = z.object({
  simuladoId: z.string(),
  deadline: z.number().int(),
}).strict();

export const CertificateRecordSchema = z.object({
  hash: z.string().regex(/^[a-f0-9]{16,128}$/),
  name: z.string().min(1).max(120),
  simuladoId: z.string(),
  score: z.number().min(0).max(100),
  issuedAt: z.string(),
}).strict();

export const CertificatesStoredSchema = z.record(z.string(), CertificateRecordSchema);

/**
 * Resultado de validação estruturado — evita exceções em boundary.
 */
export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function safeParseJSON<T>(
  schema: { safeParse: (input: unknown) => { success: boolean; data?: T; error?: { message: string } } },
  json: string,
  maxBytes?: number,
): ValidationResult<T> {
  if (maxBytes && json.length > maxBytes) {
    return { ok: false, error: `payload excede limite (${json.length} > ${maxBytes} bytes)` };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    return { ok: false, error: `JSON inválido: ${(err as Error).message}` };
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: result.error?.message ?? 'schema inválido' };
  }
  return { ok: true, data: result.data as T };
}
