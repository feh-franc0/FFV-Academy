'use client';

/**
 * HomeBaseRedirect — regra de personalização P0 do PERSONALIZATION_PLAN.
 *
 * Quando o usuário tem `homeBase` setado nas preferences, abrir a landing
 * (`/`) redireciona automaticamente pra essa base. Sem isso, ele toda vez
 * tem que clicar pra entrar.
 *
 * Escape hatches:
 *   - `?nohome=1` na URL desliga o redirect (pra ver a landing pública)
 *   - localStorage `ffv_skip_home_redirect=1` (toggle persistente)
 *   - Anti-loop: só redireciona quando pathname === "/"
 *
 * SSR-safe: hidrata client-side. A landing renderiza enquanto o redirect
 * dispara (~100ms), evitando flash em quem não tem homeBase setado.
 */

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BASE_REGISTRY } from '@/lib/bases/registry';

const SKIP_FLAG_KEY = 'ffv_skip_home_redirect';

export function HomeBaseRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { prefs, hydrated } = useUserPreferences();

  useEffect(() => {
    if (!hydrated) return;
    if (pathname !== '/') return;
    // Escape via query param (?nohome=1)
    if (search?.get('nohome') === '1') return;
    // Escape via localStorage persistente
    try {
      if (window.localStorage.getItem(SKIP_FLAG_KEY) === '1') return;
    } catch {
      // ignore
    }

    const slug = prefs.homeBase;
    if (!slug) return;

    const base = BASE_REGISTRY[slug];
    if (!base) return; // base sumiu/desabilitada — não redireciona

    // router.replace evita acumular histórico de redirects
    router.replace(base.basePath);
  }, [hydrated, pathname, prefs.homeBase, router, search]);

  return null;
}

/** Utilitário pra usar em outros lugares (ex: link "ver landing" no perfil). */
export function setSkipHomeRedirect(skip: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (skip) window.localStorage.setItem(SKIP_FLAG_KEY, '1');
    else window.localStorage.removeItem(SKIP_FLAG_KEY);
  } catch {
    // localStorage cheio / Safari privado — silenciamos
  }
}
