'use client';

import { useLayoutEffect, useRef } from 'react';
import type { BaseTheme } from '@/lib/bases/theme';

/**
 * BaseThemeProvider — força um tema de base (medvet, direito, design...) no
 * documento INTEIRO. Necessário porque o GameHUD (top bar), MobileNav e outros
 * elementos do app chrome ficam FORA da página da base — herdam as CSS vars do
 * <html>. Sem isso, o usuário em dark mode veria a top bar preta e o conteúdo
 * da base cream — inconsistente.
 *
 * Estratégia:
 * 1. Força data-theme="light" no <html> (override do dark mode do usuário).
 * 2. Aplica overrides de CSS vars (--ffv-bg, --ffv-blue, etc.) em :root via
 *    document.documentElement.style.setProperty.
 * 3. No unmount, restaura o data-theme anterior e remove os overrides.
 *
 * Use em layouts de base: app/<base>/layout.tsx → <BaseThemeProvider theme={X}>
 */

interface Props {
  theme: BaseTheme;
  children: React.ReactNode;
}

/**
 * Apenas vars CORE são sobrescritas — `--ffv-amber`, `--ffv-orange`,
 * `--ffv-purple`, `--ffv-pink`, etc. ficam com os defaults do light mode
 * (paleta editorial: amber #b45309, teal #0e7490, etc.). Sobrescrever esses
 * "extras" especulativamente quebra gradientes da landing que usam
 * `var(--ffv-amber)` literal.
 */
function themeToCssVars(theme: BaseTheme): Record<string, string> {
  return {
    // Tokens semânticos shadcn
    '--background': theme.paper,
    '--foreground': theme.ink,
    '--card': theme.cream,
    '--card-foreground': theme.ink,
    '--popover': theme.cream,
    '--popover-foreground': theme.ink,
    '--primary': theme.accent,
    '--secondary': theme.cream,
    '--secondary-foreground': theme.ink,
    '--muted': theme.cream,
    '--muted-foreground': theme.muted,
    '--border': theme.border,
    '--input': theme.cream,
    '--ring': theme.accent,

    // FFV palette — core
    '--ffv-bg': theme.paper,
    '--ffv-bg2': theme.cream,
    '--ffv-border': theme.border,
    '--ffv-muted': theme.muted,
    '--ffv-blue': theme.accent,
    '--ffv-green': theme.success,
    '--ffv-paper': theme.paper,
    '--ffv-ink': theme.ink,
    // --ffv-gold é usado em rankings, quests, MyRankCard, FfvButton.gold etc.
    // Mapeamos pelo success (cor mais profunda) — assim os botões "dourados"
    // têm peso visual de CTA primário em vez de pastel washed out.
    '--ffv-gold': theme.success,
    // --ffv-purple aparece em gradients (FinalCta, ComunidadeAutor) junto com
    // --ffv-blue. Sem override fica teal default — disruptivo no tema da base.
    '--ffv-purple': theme.success,

    // Hero glow puxado do accent — fica coerente com o resto da paleta
    '--ffv-hero-glow': `color-mix(in srgb, ${theme.accent} 10%, transparent)`,

    // FFV palette — extras (opcionais). Cada base que quiser uma paleta
    // 100% coerente seta esses; quem omite herda os defaults globais.
    ...(theme.extras?.amber  ? { '--ffv-amber':  theme.extras.amber }  : {}),
    ...(theme.extras?.orange ? { '--ffv-orange': theme.extras.orange } : {}),
    ...(theme.extras?.pink   ? { '--ffv-pink':   theme.extras.pink }   : {}),
    ...(theme.extras?.yellow ? { '--ffv-yellow': theme.extras.yellow } : {}),
  };
}

export function BaseThemeProvider({ theme, children }: Props) {
  const restoreRef = useRef<{ theme: string | null; vars: string[] } | null>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const prevTheme = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'light');

    const vars = themeToCssVars(theme);
    Object.entries(vars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });

    restoreRef.current = { theme: prevTheme, vars: Object.keys(vars) };

    return () => {
      if (restoreRef.current) {
        const r = restoreRef.current;
        if (r.theme) root.setAttribute('data-theme', r.theme);
        else root.removeAttribute('data-theme');
        r.vars.forEach(k => root.style.removeProperty(k));
      }
    };
  }, [theme]);

  return <>{children}</>;
}
