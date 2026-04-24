import * as Sentry from '@sentry/nextjs';

/**
 * Sentry — captura exceções não tratadas em produção.
 *
 * DSN via variável de ambiente NEXT_PUBLIC_SENTRY_DSN.
 * Se não configurado, Sentry fica completamente desabilitado (sem overhead).
 *
 * Configuração intencional:
 * - enabled: somente em produção E com DSN presente. Em dev/staging sem DSN,
 *   os erros ficam apenas no console, sem enviar para Sentry.
 * - tracesSampleRate: 0.1 (10% das transações). Controla custo do plano.
 *   Aumentar para 0.5 em sprints de performance profiling.
 * - environment: propaga NODE_ENV para o dashboard do Sentry, permitindo
 *   filtrar por ambiente (production vs. preview deployments).
 *
 * ATENÇÃO: NÃO use withSentryConfig no next.config.ts sem DSN e auth token
 * configurados — isso quebraria o build. O sentry.client.config.ts sozinho
 * já é suficiente para captura básica de exceções no browser.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Desabilita completamente se não estiver em produção ou sem DSN
  enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 10% das transações — controla custo do plano Sentry
  tracesSampleRate: 0.1,

  environment: process.env.NODE_ENV,
});

/**
 * Expõe captureException via globalThis para que api-client.ts possa
 * chamar sem import estático de @sentry/nextjs.
 *
 * Motivo: import estático de @sentry/nextjs quebraria SSR e testes.
 * A referência em globalThis é segura — existe apenas no browser,
 * é undefined em SSR/testes, e api-client usa optional chaining (?.).
 */
(globalThis as unknown as { Sentry: typeof Sentry }).Sentry = Sentry;
