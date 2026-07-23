'use client';

import { createContext, useContext } from 'react';
import type { BaseNavItem } from '@/lib/bases/types';

/**
 * BaseNavContext — controla quais itens de navegação aparecem na top bar
 * (GameHUD) por base.
 *
 * Itens GLOBAIS (Progresso, Simulados, XP/Level/Streak/Search) ficam SEMPRE
 * visíveis. O array `hubNavItems` controla apenas os itens "de hub" no centro
 * do header — tech mostra IA/AWS/Engenharia/Claude; medvet mostra (nada por
 * padrão, ou o que a base configurar).
 *
 * Alimentado pelo `BaseProvider` (que resolve a `BaseConfig` da rota atual).
 * Pra retrocompat, ainda aceita `value` direto.
 */

// Re-export pra manter imports antigos funcionando (nav.ts dos bases importam daqui).
export type { BaseNavItem };

interface BaseNavContextValue {
  hubNavItems: BaseNavItem[];
  /** Se true, esconde também News e Simulados globais da nav (ex.: base sem simulado). */
  hideGlobalContentNav?: boolean;
}

const DEFAULT_VALUE: BaseNavContextValue = {
  hubNavItems: [],
};

const BaseNavContext = createContext<BaseNavContextValue>(DEFAULT_VALUE);

export function BaseNavProvider({
  value,
  children,
}: {
  value: BaseNavContextValue;
  children: React.ReactNode;
}) {
  return <BaseNavContext.Provider value={value}>{children}</BaseNavContext.Provider>;
}

export function useBaseNav(): BaseNavContextValue {
  return useContext(BaseNavContext);
}
