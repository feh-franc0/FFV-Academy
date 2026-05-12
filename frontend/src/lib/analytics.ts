'use client';

/**
 * Helper para Plausible custom events.
 *
 * Plausible é privacy-first (sem cookies, sem fingerprint, LGPD-ok). O script
 * é carregado em layout.tsx; aqui criamos um adapter type-safe para eventos
 * custom que ajudam a entender comportamento sem tracking pessoal.
 *
 * Uso:
 *   import { track } from '@/lib/analytics';
 *   track('module_completed', { slug: 'rag-fundamentos', xp: 75 });
 *
 * Eventos atuais:
 *   - module_started / module_completed
 *   - quiz_passed / quiz_failed
 *   - signup_clicked / login_completed
 *   - search_performed
 *   - playlist_started
 *   - certificate_downloaded
 *
 * Convenção: snake_case curto, sem PII.
 */

type EventName =
  | 'module_started'
  | 'module_completed'
  | 'quiz_passed'
  | 'quiz_failed'
  | 'signup_clicked'
  | 'login_completed'
  | 'search_performed'
  | 'playlist_started'
  | 'certificate_downloaded'
  | 'streak_broken'
  | 'streak_milestone'
  | 'level_up'
  | 'badge_unlocked'
  | 'cta_clicked';

type EventProps = Record<string, string | number | boolean>;

interface PlausibleWindow {
  plausible?: (event: string, opts?: { props?: EventProps; callback?: () => void }) => void;
}

export function track(event: EventName, props?: EventProps): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as PlausibleWindow;
  try {
    w.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Fail silently — analytics never breaks UX
  }
}
