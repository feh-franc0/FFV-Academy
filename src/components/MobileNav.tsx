'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Cloud, Wrench, Bot, ChartBarIncreasing, Search } from 'lucide-react';
import { HUBS } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';
import type { ComponentType, SVGProps } from 'react';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const HUB_ICONS: Record<string, LucideIcon> = {
  '/ia': BrainCircuit,
  '/aws': Cloud,
  '/engenharia': Wrench,
  '/claude-anthropic': Bot,
};

type Item = { href: string; label: string; color: string };

const PROGRESSO: Item = {
  href: '/progresso',
  label: 'Progresso',
  color: 'var(--ffv-green)',
};

function NavIcon({ href, size }: { href: string; size: number }) {
  const Icon = href === '/progresso' ? ChartBarIncreasing : HUB_ICONS[href];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={1.8} />;
}

export function MobileNav() {
  const pathname = usePathname() ?? '/';
  const { dueCards } = useGameState();

  const items: Item[] = [
    ...HUBS.map(h => ({ href: h.href, label: h.shortName, color: h.color })),
    PROGRESSO,
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      aria-label="Navegação principal"
      style={{
        background: 'color-mix(in srgb, var(--ffv-bg) 94%, transparent)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '1px solid var(--ffv-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <ul className="flex items-stretch justify-around">
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const showDue = item.href === '/progresso' && dueCards.length > 0;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center relative"
                style={{
                  padding: '10px 6px 12px',
                  color: active ? item.color : 'var(--ffv-muted)',
                  textDecoration: 'none',
                }}
              >
                <NavIcon href={item.href} size={20} />
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    marginTop: 4,
                    letterSpacing: '0.02em',
                    fontWeight: active ? 700 : 500,
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
                {showDue && (
                  <span
                    aria-label={`${dueCards.length} cards pendentes`}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: '22%',
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
                    {dueCards.length > 9 ? '9+' : dueCards.length}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {/* Search button — triggers CommandPalette */}
        <li className="flex-1">
          <button
            type="button"
            aria-label="Buscar"
            onClick={() => {
              type W = Window & { __ffvOpenPalette?: () => void };
              (window as W).__ffvOpenPalette?.();
            }}
            className="flex flex-col items-center justify-center w-full"
            style={{
              padding: '10px 6px 12px',
              color: 'var(--ffv-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Search size={20} strokeWidth={1.8} />
            <span
              className="font-mono"
              style={{ fontSize: 10, marginTop: 4, letterSpacing: '0.02em', fontWeight: 500 }}
            >
              Buscar
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
