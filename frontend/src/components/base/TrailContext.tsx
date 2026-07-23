'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Module, Trail } from '@/lib/bases/types';
import type { BaseTheme } from '@/lib/bases/theme';

/**
 * TrailContext — escopado por rota de módulo. Expõe a trilha atual, o módulo
 * corrente e o estado do drawer de sumário (que o FloatingTrailMenuButton
 * controla em mobile).
 *
 * Mounted por `BaseModule` (uma vez por página de módulo). O drawer e o FAB
 * ficam fora da árvore do `BaseModule` mas dentro do mesmo Provider — basta
 * usar `useTrail()` em ambos.
 */

export interface TrailContextValue {
  trail: Trail;
  currentModule: Module;
  /** Índice 0-based do currentModule em trail.modules. */
  currentIndex: number;
  basePath: string;
  baseName: string;
  theme: BaseTheme;
  /** Slugs de módulos concluídos (geralmente vindo do GameState). */
  completedSlugs: ReadonlySet<string>;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const TrailContext = createContext<TrailContextValue | null>(null);

interface ProviderProps {
  trail: Trail;
  currentModule: Module;
  basePath: string;
  baseName: string;
  theme: BaseTheme;
  /** Slugs concluídos — pode vir vazio se gamificação está off na base. */
  completedSlugs?: ReadonlyArray<string>;
  children: React.ReactNode;
}

export function TrailProvider({
  trail,
  currentModule,
  basePath,
  baseName,
  theme,
  completedSlugs,
  children,
}: ProviderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen(v => !v), []);

  const completedSet = useMemo(
    () => new Set(completedSlugs ?? []),
    [completedSlugs],
  );
  const currentIndex = useMemo(
    () => trail.modules.findIndex(m => m.slug === currentModule.slug),
    [trail.modules, currentModule.slug],
  );

  const value = useMemo<TrailContextValue>(
    () => ({
      trail,
      currentModule,
      currentIndex,
      basePath,
      baseName,
      theme,
      completedSlugs: completedSet,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [trail, currentModule, currentIndex, basePath, baseName, theme,
     completedSet, drawerOpen, openDrawer, closeDrawer, toggleDrawer],
  );

  return <TrailContext.Provider value={value}>{children}</TrailContext.Provider>;
}

/** Hook opcional — retorna null se chamado fora de um TrailProvider. */
export function useTrailOptional(): TrailContextValue | null {
  return useContext(TrailContext);
}

/** Hook obrigatório — joga se chamado fora. Use em componentes que SÓ aparecem em página de módulo. */
export function useTrail(): TrailContextValue {
  const ctx = useContext(TrailContext);
  if (!ctx) {
    throw new Error('useTrail() precisa ser chamado dentro de <TrailProvider>');
  }
  return ctx;
}
