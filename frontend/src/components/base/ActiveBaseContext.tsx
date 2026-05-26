'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BASE_REGISTRY, DEFAULT_BASE_SLUG } from '@/lib/bases/registry';
import { resolveBaseConfig } from '@/lib/bases/resolver';
import type { BaseConfig } from '@/lib/bases/types';

/**
 * ActiveBase — base "ativa" para o usuário.
 *
 * Por que existe: rotas globais (/progresso, /revisar, /perfil...)
 * são SHARED entre bases. O resolver não sabe em qual base o usuário "está"
 * vindo de — então cai no DEFAULT (tech) e o tema/microcopy vazam.
 *
 * Solução: rastreamos a última base que o usuário entrou via pathname e
 * persistimos em localStorage. Em rotas globais, o AppChrome aplica tema
 * + nav da base ativa, mantendo o usuário "no mundinho dele".
 *
 * Prioridade da base ativa:
 *   1. Base derivada do pathname atual (se entrou em uma base agora)
 *   2. Base persistida em localStorage (última base visitada)
 *   3. Default global (tecnologia) — first-time visitor sem histórico
 */

const STORAGE_KEY = 'ffv_active_base_slug';

interface ActiveBaseContextValue {
  /** Base ativa — NUNCA null. Default cai em tecnologia se nada melhor for conhecido. */
  base: BaseConfig;
  /** True se a base veio do pathname atual; false se veio do storage (sticky). */
  isPathnameDerived: boolean;
  /** Setter manual — útil pra switcher de base, link de "trocar base", etc. */
  setBaseSlug: (slug: string) => void;
}

const ActiveBaseContext = createContext<ActiveBaseContextValue | null>(null);

export function ActiveBaseProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const resolved = useMemo(() => resolveBaseConfig(pathname), [pathname]);
  const [storedSlug, setStoredSlug] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v && BASE_REGISTRY[v]) setStoredSlug(v);
    } catch {
      /* SSR ou storage bloqueado — segue sem stored slug */
    }
  }, []);

  useEffect(() => {
    if (resolved.base && !resolved.isMarketing && !resolved.isAppGlobal) {
      const slug = resolved.base.slug;
      try {
        window.localStorage.setItem(STORAGE_KEY, slug);
      } catch {
        /* storage bloqueado */
      }
      setStoredSlug(slug);
    }
  }, [resolved.base, resolved.isMarketing, resolved.isAppGlobal]);

  const setBaseSlug = useCallback((slug: string) => {
    if (!BASE_REGISTRY[slug]) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, slug);
    } catch {
      /* storage bloqueado */
    }
    setStoredSlug(slug);
  }, []);

  const value = useMemo<ActiveBaseContextValue>(() => {
    const isPathnameDerived = !!(resolved.base && !resolved.isAppGlobal && !resolved.isMarketing);
    const base: BaseConfig = isPathnameDerived && resolved.base
      ? resolved.base
      : (storedSlug && BASE_REGISTRY[storedSlug])
        ? BASE_REGISTRY[storedSlug]
        : BASE_REGISTRY[DEFAULT_BASE_SLUG];
    return { base, isPathnameDerived, setBaseSlug };
  }, [resolved.base, resolved.isAppGlobal, resolved.isMarketing, storedSlug, setBaseSlug]);

  return <ActiveBaseContext.Provider value={value}>{children}</ActiveBaseContext.Provider>;
}

export function useActiveBase(): ActiveBaseContextValue {
  const ctx = useContext(ActiveBaseContext);
  if (!ctx) {
    return {
      base: BASE_REGISTRY[DEFAULT_BASE_SLUG],
      isPathnameDerived: false,
      setBaseSlug: () => {},
    };
  }
  return ctx;
}
