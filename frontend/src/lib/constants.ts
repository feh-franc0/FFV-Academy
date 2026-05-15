/**
 * Constantes centralizadas de configuração do jogo.
 *
 * Centralizar aqui evita magic numbers espalhados e facilita balanceamento.
 * Qualquer número "tunável" do domínio deve viver neste arquivo.
 */

export const GAME_CONFIG = {
  // ─── XP split ───
  /** Fração do XP do módulo concedido pelo só ler/completar (sem depender do quiz). */
  XP_BASE_RATIO: 0.7,
  /** Fração do XP do módulo proporcional à nota do quiz (0..1). */
  XP_QUIZ_BONUS_RATIO: 0.3,
  /** XP concedido ao revisitar um módulo já completo. */
  XP_REVISIT: 5,

  // ─── Streak & freezes ───
  /** Máximo de streak freezes em banco. */
  MAX_STREAK_FREEZES: 2,
  /** A cada N dias de streak, ganha 1 freeze (se abaixo do cap). */
  FREEZE_EVERY_N_DAYS: 7,

  // ─── Daily Module ───
  /** XP bônus por completar o módulo do dia no mesmo dia. */
  DAILY_MODULE_BONUS_XP: 25,

  // ─── Time Attack ───
  /** XP bônus por completar quiz perfeito em modo time-attack. */
  TIME_ATTACK_BONUS_XP: 30,
  /** Segundos por pergunta no modo time-attack. */
  TIME_ATTACK_SECONDS_PER_QUESTION: 30,

  // ─── SRS ───
  /** Cards com easeFactor acima disso são candidatos a GC (se também interval > threshold). */
  SRS_GC_EASE_THRESHOLD: 3.0,
  /** Cards com interval acima disso (em dias) são candidatos a GC. */
  SRS_GC_INTERVAL_DAYS: 90,

  // ─── Retenção / trim defensivo ───
  /** Em caso de erro de escrita por cota, corta studyDays para os N últimos. */
  FALLBACK_STUDY_DAYS_TRIM: 30,
  /** Em caso de erro de escrita por cota, corta reviewCards para os N últimos. */
  FALLBACK_CARDS_TRIM: 100,

  // ─── Referral ───
  /** XP bônus recebido por chegar via link de referral. */
  REFERRAL_BONUS_XP: 50,
  /** XP bônus recebido por um referrer quando alguém entra pelo link dele. */
  REFERRER_BONUS_XP: 100,
  /** Regex de validação de refId vindo de URL (?ref=). Bloqueia tudo fora do set permitido. */
  REFERRAL_ID_REGEX: /^[a-z0-9]{3,32}$/,

  // ─── Badges thresholds ───
  MODULES_25: 25,
  MODULES_75: 75,
  STREAK_3: 3,
  STREAK_7: 7,
  STREAK_14: 14,
  STREAK_30: 30,
  STREAK_60: 60,
  SPEED_RUN_MODULES_PER_DAY: 3,
  MARATHON_MODULES_PER_DAY: 5,
  PERFECT_5: 5,
  PERFECT_20: 20,
  CARDS_50: 50,
  CARDS_200: 200,
  TWO_TRAILS: 2,
  FIVE_TRAILS: 5,
  EXPLORER_HUBS: 3,
  POLYGLOT_HUBS: 4,
  COMEBACK_DAYS_GAP: 7,
  EARLY_BIRD_HOUR_MAX: 8,   // < 8h
  NIGHT_OWL_HOUR_MIN: 22,   // >= 22h
  AURORA_HOUR_MAX: 6,       // < 6h
  AURORA_DAYS_REQUIRED: 3,
  MIDNIGHT_OIL_HOUR_MIN: 2,
  MIDNIGHT_OIL_HOUR_MAX: 5,
  SNIPER_PERFECT_STREAK: 10,
  SPEEDRUN_TRAIL_HOURS: 24,
  DAILY_GOAL_7_DAYS: 7,

  // ─── Mastery ───
  /** Score médio mínimo de quizzes pra conquistar badge de mastery da trilha. */
  MASTERY_QUIZ_AVG: 0.8,

  // ─── localStorage ───
  /** Comprimento máximo razoável de um JSON de estado importado (bytes). */
  IMPORT_STATE_MAX_BYTES: 2_000_000, // 2 MB
} as const;

/** Chaves de localStorage — única fonte de verdade. */
export const STORAGE_KEYS = {
  GAME_STATE: 'ffv_academy',
  THEME: 'ffv_theme',
  USER_NAME: 'ffv_user_name',
  DAILY_MODULE: 'ffv_daily_module',
  REFERRAL: 'ffv_referral',
  MY_REFERRAL_ID: 'ffv_my_ref_id',
  ONBOARDING_DISMISSED: 'ffv_onboarding_dismissed',
  USER: 'ffv_user',
  SIMULADO_ATTEMPTS: 'ffv_simulado_attempts',
  SIMULADO_TIMER: 'ffv_simulado_timer',
  CERTIFICATES: 'ffv_certificates',
  PROGRESS_LAST_SYNC: 'ffv_progress_last_sync',
  TUTOR_ASK_HISTORY: 'ffv_tutor_ask_history',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
