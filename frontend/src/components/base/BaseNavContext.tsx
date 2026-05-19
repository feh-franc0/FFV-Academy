'use client';

import { createContext, useContext } from 'react';

/**
 * BaseNavContext — controla quais itens de navegação aparecem na top bar
 * (GameHUD) por base.
 *
 * Itens GLOBAIS (Progresso, Simulados, XP/Level/Streak/Search) ficam SEMPRE
 * visíveis. O array `hubNavItems` controla apenas os itens "de hub" no centro
 * do header — tech mostra IA/AWS/Engenharia/Claude; medvet mostra (nada por
 * padrão, ou o que a base configurar).
 *
 * Setado por cada base via `app/<base>/layout.tsx`. Default = tech.
 */

export interface BaseNavItem {
  href: string;
  /** Texto curto exibido no header (ex.: "IA"). */
  label: string;
  /** Cor de destaque do item ativo. */
  color?: string;
  /** Ícone (string emoji ou nome do lucide icon — implementado em GameHUD). */
  iconName?: string;
  /** Mostrar somente em viewport ≥1024px. */
  lgOnly?: boolean;
  /** Mostrar somente em viewport ≥1280px. */
  xlOnly?: boolean;
  /** Marca como "NOVO" no badge. */
  isNew?: boolean;
}

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
