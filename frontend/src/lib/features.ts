/**
 * Feature flags — controla quais funcionalidades opcionais estão ativas.
 *
 * Lidas no build time via NEXT_PUBLIC_*. Quando false, a UI esconde/desativa
 * o caminho da feature e nenhuma requisição é feita ao backend.
 *
 * Para ativar uma feature, defina a env var correspondente no build:
 *   NEXT_PUBLIC_FEATURE_BILLING_ENABLED=true
 *   NEXT_PUBLIC_FEATURE_TUTOR_AI_ENABLED=true
 *   NEXT_PUBLIC_FEATURE_PHONE_AUTH_ENABLED=true
 *
 * Backend tem flags equivalentes (FEATURE_BILLING_ENABLED etc) — devem
 * estar em sincronia com as do frontend.
 */
export const FEATURES = {
  billing: process.env.NEXT_PUBLIC_FEATURE_BILLING_ENABLED === 'true',
  tutorAI: process.env.NEXT_PUBLIC_FEATURE_TUTOR_AI_ENABLED === 'true',
  phoneAuth: process.env.NEXT_PUBLIC_FEATURE_PHONE_AUTH_ENABLED === 'true',
} as const;

export type FeatureName = keyof typeof FEATURES;
