'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  Cloud,
  Wrench,
  Bot,
  ChartBarIncreasing,
  Search,
  Target,
  Brain,
  Code2,
  Database,
  Hammer,
  Menu,
  X,
  BookOpen,
  UserCog,
  GraduationCap,
} from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { useActiveBase } from '@/components/base/ActiveBaseContext';
import { selectDueCardsForBase } from '@/lib/bases/state-selectors';
import { useTheme } from '@/hooks/useTheme';
import type { ComponentType, SVGProps } from 'react';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const HUB_ICONS: Record<string, LucideIcon> = {
  '/ia': BrainCircuit,
  '/aws': Cloud,
  '/engenharia': Wrench,
  '/claude-anthropic': Bot,
  '/fundamentos': Brain,
  '/programacao': Code2,
  '/dados': Database,
  '/construcao': Hammer,
};

// Mapeamento por iconName (usado por BaseNavItem da base) → Lucide icon.
const ICON_BY_NAME: Record<string, LucideIcon> = {
  brain: BrainCircuit,
  cloud: Cloud,
  wrench: Wrench,
  bot: Bot,
  book: BookOpen,
  target: Target,
  chart: ChartBarIncreasing,
};

type Item = { href: string; label: string; color: string; Icon: LucideIcon };

/** Itens primários — navegação de plataforma (Home, Explorar, Progresso, Ranking).
 * Hubs específicos (IA, AWS, etc) ficam no drawer "Mais" — mais discoverable
 * e menos cluttered no bar de 360px. */
function getPrimaryItems(): Item[] {
  return [
    { href: '/', label: 'Início', color: 'var(--ffv-blue)', Icon: BrainCircuit },
    { href: '/explorar', label: 'Explorar', color: 'var(--ffv-purple)', Icon: Search },
    { href: '/progresso', label: 'Progresso', color: 'var(--ffv-green)', Icon: ChartBarIncreasing },
  ];
}

export function MobileNav() {
  const pathname = usePathname() ?? '/';
  const { dueCards } = useGameState();
  const { base: activeBase } = useActiveBase();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Cards SRS devidos da base ativa — sem cross-base.
  const baseDueCards = selectDueCardsForBase(dueCards, activeBase.slug);

  // Fecha sheet ao trocar de rota
  useEffect(() => { setSheetOpen(false); }, [pathname]);

  // Lock scroll quando sheet aberto
  useEffect(() => {
    if (sheetOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [sheetOpen]);

  const primary = getPrimaryItems();

  // Hubs do drawer — vêm da BASE ATIVA (não mais HUBS hardcoded tech).
  const baseHubs = activeBase.nav.hubNavItems;
  const hideGlobalContent = activeBase.nav.hideGlobalContentNav;

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        aria-label="Navegação principal"
        style={{
          background: 'color-mix(in srgb, var(--ffv-bg) 96%, transparent)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderTop: '1px solid var(--ffv-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <ul
          className="grid items-stretch"
          style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
        >
          {primary.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href} className="flex-1" style={{ minWidth: 0 }}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className="flex flex-col items-center justify-center relative w-full"
                  style={{
                    minHeight: 56,
                    padding: '8px 2px 10px',
                    color: active ? item.color : 'var(--ffv-muted)',
                    textDecoration: 'none',
                    minWidth: 0,
                  }}
                >
                  <item.Icon size={22} strokeWidth={1.8} />
                  <span
                    className="font-mono truncate"
                    style={{
                      fontSize: 10,
                      marginTop: 3,
                      letterSpacing: '0.02em',
                      fontWeight: active ? 700 : 500,
                      width: '100%',
                      textAlign: 'center',
                      display: 'block',
                      paddingLeft: 2,
                      paddingRight: 2,
                    }}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '25%',
                        right: '25%',
                        height: 2,
                        background: item.color,
                        borderRadius: '0 0 2px 2px',
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
          <li className="flex-1" style={{ minWidth: 0 }}>
            <button
              type="button"
              aria-label="Mais opções"
              aria-expanded={sheetOpen}
              onClick={() => setSheetOpen(true)}
              className="flex flex-col items-center justify-center w-full relative"
              style={{
                minHeight: 56,
                padding: '8px 2px 10px',
                color: 'var(--ffv-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                minWidth: 0,
              }}
            >
              <Menu size={22} strokeWidth={1.8} />
              <span
                className="font-mono"
                style={{ fontSize: 10, marginTop: 3, letterSpacing: '0.02em', fontWeight: 500 }}
              >
                Mais
              </span>
              {baseDueCards.length > 0 && (
                <span
                  aria-label={`${baseDueCards.length} cards pendentes`}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: '24%',
                    minWidth: 16,
                    height: 16,
                    padding: '0 4px',
                    borderRadius: 999,
                    background: 'var(--ffv-green)',
                    color: '#0d1117',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  {baseDueCards.length > 9 ? '9+' : baseDueCards.length}
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {sheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mais opções"
          className="md:hidden fixed inset-0 z-[60]"
          onClick={() => setSheetOpen(false)}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'color-mix(in srgb, #000 58%, transparent)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />
          <div
            onClick={e => e.stopPropagation()}
            className="absolute left-0 right-0 bottom-0 overflow-hidden"
            style={{
              background: 'var(--ffv-bg)',
              borderTop: '1px solid var(--ffv-border)',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
              maxHeight: '80vh',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.35)',
            }}
          >
            <div
              aria-hidden
              className="mx-auto mt-2 mb-1"
              style={{
                width: 42,
                height: 4,
                borderRadius: 4,
                background: 'var(--ffv-border)',
              }}
            />
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <span className="font-bold text-base">Mais</span>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setSheetOpen(false)}
                style={{ color: 'var(--ffv-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 70px)' }}>
              {baseHubs.length > 0 && (
                <SheetSection title={`Hubs · ${activeBase.name}`}>
                  {baseHubs.map(h => {
                    const Icon = HUB_ICONS[h.href]
                      ?? (h.iconName ? ICON_BY_NAME[h.iconName] : null)
                      ?? GraduationCap;
                    return (
                      <SheetLink
                        key={h.href}
                        href={h.href}
                        label={h.label}
                        color={h.color ?? 'var(--ffv-blue)'}
                        Icon={Icon}
                      />
                    );
                  })}
                </SheetSection>
              )}

              <SheetSection title="Atividade">
                <SheetLink href="/progresso" label="Progresso" color="var(--ffv-green)" Icon={ChartBarIncreasing} />
                <SheetLink href="/revisar" label={baseDueCards.length > 0 ? `Revisar (${baseDueCards.length})` : 'Revisar'} color="var(--ffv-green)" Icon={BookOpen} />
                {!hideGlobalContent && (
                  <>
                    <SheetLink href="/revisao" label="Maratona de Revisão" color="var(--ffv-blue)" Icon={Brain} />
                    <SheetLink href="/plano" label="Meu Plano de Estudos" color="var(--ffv-purple)" Icon={Target} />
                    <SheetLink href="/simulados" label="Simulados" color="#f78166" Icon={Target} />
                    <SheetLink href="/certificacoes" label="Prep de Certificações" color="var(--ffv-yellow)" Icon={GraduationCap} />
                  </>
                )}
                {activeBase.simulados?.map(s => (
                  <SheetLink key={s.slug} href={s.href} label={s.title} color="#f78166" Icon={Target} />
                ))}
              </SheetSection>

              <SheetSection title="Comunidade">
                <SheetLink href="/times" label="Times de Estudo" color="var(--ffv-blue)" Icon={Brain} />
                <SheetLink href="/perfil" label="Meu Perfil Dev" color="var(--ffv-green)" Icon={ChartBarIncreasing} />
                <SheetLink href="/devcard" label="Dev Card" color="var(--ffv-purple)" Icon={GraduationCap} />
              </SheetSection>

              <SheetSection title="Conta">
                <SheetLink href="/preferencias" label="Preferências" color="var(--ffv-muted)" Icon={UserCog} />
                <ThemeToggleSheet />
              </SheetSection>

              <button
                type="button"
                onClick={() => {
                  type W = Window & { __ffvOpenPalette?: () => void };
                  setSheetOpen(false);
                  requestAnimationFrame(() => (window as W).__ffvOpenPalette?.());
                }}
                className="w-full flex items-center justify-center gap-2 mt-2 rounded-xl"
                style={{
                  height: 48,
                  background: 'color-mix(in srgb, var(--ffv-blue) 14%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--ffv-blue) 32%, transparent)',
                  color: 'var(--ffv-blue)',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                <Search size={16} /> Buscar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SheetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 10,
          color: 'var(--ffv-muted)',
          letterSpacing: '0.14em',
          padding: '4px 4px 8px',
        }}
      >
        {title}
      </div>
      <ul className="flex flex-col gap-1">{children}</ul>
    </div>
  );
}

function SheetLink({
  href,
  label,
  color,
  Icon,
}: {
  href: string;
  label: string;
  color: string;
  Icon: LucideIcon;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl"
        style={{
          minHeight: 52,
          padding: '0 12px',
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          color: 'var(--foreground)',
          textDecoration: 'none',
        }}
      >
        <span
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
            color,
          }}
        >
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
}

/** Linha do drawer com toggle de tema — usuário mobile precisa de acesso
 *  óbvio ao tema (desktop tem o ThemeToggle visível no header). */
function ThemeToggleSheet() {
  const { theme, toggle, mounted } = useTheme();
  if (!mounted) return null;
  const isDark = theme === 'dark';
  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Trocar para tema ${isDark ? 'claro' : 'escuro'}`}
        className="w-full flex items-center gap-3 rounded-xl"
        style={{
          minHeight: 52,
          padding: '0 12px',
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          color: 'var(--foreground)',
          cursor: 'pointer',
        }}
      >
        <span
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'color-mix(in srgb, var(--ffv-blue) 14%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
            color: 'var(--ffv-blue)',
            fontSize: 16,
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </span>
        <span className="text-sm font-medium flex-1 text-left">
          {isDark ? 'Tema claro' : 'Tema escuro'}
        </span>
        <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      </button>
    </li>
  );
}
