'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HUBS } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

type Item = { href: string; icon: string; label: string; color: string };

const PROGRESSO: Item = {
  href: '/progresso',
  icon: '📊',
  label: 'Progresso',
  color: 'var(--ffv-green)',
};

export function MobileNav() {
  const pathname = usePathname() ?? '/';
  const { dueCards } = useGameState();

  const items: Item[] = [
    ...HUBS.map(h => ({ href: h.href, icon: h.icon, label: h.shortName, color: h.color })),
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
                  padding: '8px 6px 10px',
                  color: active ? item.color : 'var(--ffv-muted)',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
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
      </ul>
    </nav>
  );
}
