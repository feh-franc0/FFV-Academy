'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listBases } from '@/lib/bases/registry';
import { useActiveBase } from '@/components/base/ActiveBaseContext';
import type { BaseConfig } from '@/lib/bases/types';

/**
 * BaseSwitcher — chip clicável no header que abre dropdown com todas as
 * bases disponíveis pra o usuário trocar contexto. Substitui o BaseHomeChip
 * que era um simples Link.
 *
 * Comportamento:
 * - Clique no chip abre o dropdown
 * - Cada item lista uma base (ícone + nome + área + status)
 * - Selecionar uma base: setBaseSlug() persiste + router.push() pra home da base
 * - Click fora ou Escape fecha
 *
 * Se só 1 base existir no registry, comporta como Link puro (sem dropdown).
 */

interface Props {
  pathname: string;
}

export function BaseSwitcher({ pathname }: Props) {
  const router = useRouter();
  const { base: activeBase, setBaseSlug } = useActiveBase();
  const bases = listBases();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isOnBaseHome = pathname === activeBase.basePath;
  const shortName = activeBase.name.length > 16 ? activeBase.name.slice(0, 14) + '…' : activeBase.name;

  // Click fora + Escape fecham o dropdown.
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  // 1 base só → renderiza como Link simples (não tem o que escolher).
  if (bases.length <= 1) {
    return (
      <Link
        href={activeBase.basePath}
        aria-label={`Home da base ${activeBase.name}`}
        aria-current={isOnBaseHome ? 'page' : undefined}
        className="ml-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all hover:opacity-90"
        style={{
          background: isOnBaseHome
            ? 'color-mix(in srgb, var(--ffv-blue) 22%, transparent)'
            : 'color-mix(in srgb, var(--ffv-blue) 14%, transparent)',
          border: '1px solid color-mix(in srgb, var(--ffv-blue) 38%, transparent)',
          color: 'var(--ffv-blue)',
          textDecoration: 'none',
        }}
      >
        <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>{activeBase.icon}</span>
        <span className="hidden sm:inline">{shortName}</span>
      </Link>
    );
  }

  function selectBase(b: BaseConfig) {
    setBaseSlug(b.slug);
    setOpen(false);
    if (pathname !== b.basePath) router.push(b.basePath);
  }

  return (
    <div ref={containerRef} className="relative ml-3">
      <button
        type="button"
        aria-label={`Trocar base — atualmente ${activeBase.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all hover:opacity-90 cursor-pointer"
        style={{
          background: isOnBaseHome
            ? 'color-mix(in srgb, var(--ffv-blue) 22%, transparent)'
            : 'color-mix(in srgb, var(--ffv-blue) 14%, transparent)',
          border: '1px solid color-mix(in srgb, var(--ffv-blue) 38%, transparent)',
          color: 'var(--ffv-blue)',
        }}
      >
        <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>{activeBase.icon}</span>
        <span className="hidden sm:inline">{shortName}</span>
        <svg
          aria-hidden
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          style={{ marginLeft: 2, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s ease' }}
        >
          <path d="M1.5 3.5 L5 7 L8.5 3.5 Z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Selecionar base de conhecimento"
          className="absolute left-0 mt-2 rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
            minWidth: 260,
            zIndex: 70,
          }}
        >
          <div
            className="px-3 py-2 font-mono uppercase"
            style={{
              fontSize: 10,
              color: 'var(--ffv-muted)',
              letterSpacing: '0.14em',
              borderBottom: '1px solid var(--ffv-border)',
            }}
          >
            Suas bases de conhecimento
          </div>
          <ul className="flex flex-col py-1">
            {bases.map(b => {
              const isCurrent = b.slug === activeBase.slug;
              return (
                <li key={b.slug}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isCurrent}
                    onClick={() => selectBase(b)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:opacity-90"
                    style={{
                      background: isCurrent
                        ? 'color-mix(in srgb, var(--ffv-blue) 10%, transparent)'
                        : 'transparent',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>{b.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{b.name}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--ffv-muted)' }}>
                        {b.area}
                      </p>
                    </div>
                    {isCurrent ? (
                      <span
                        aria-label="Base atual"
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: 'color-mix(in srgb, var(--ffv-green) 18%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--ffv-green) 38%, transparent)',
                          color: 'var(--ffv-green)',
                        }}
                      >
                        ATUAL
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="text-xs"
                        style={{ color: 'var(--ffv-muted)' }}
                      >
                        →
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div
            className="px-3 py-2 border-t"
            style={{ borderColor: 'var(--ffv-border)' }}
          >
            <Link
              href="/#solicitar-base"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: 'var(--ffv-blue)', textDecoration: 'none' }}
            >
              <span aria-hidden>＋</span>
              Criar uma nova base
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
