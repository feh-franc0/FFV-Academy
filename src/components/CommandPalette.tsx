'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRICULUM, HUBS, getTrailHref, type Module, type Trail } from '@/lib/curriculum';

type Item = {
  id: string;
  kind: 'article' | 'trail' | 'hub' | 'page';
  title: string;
  subtitle?: string;
  icon: string;
  href: string;
  haystack: string;
  accent: string;
};

function buildItems(): Item[] {
  const items: Item[] = [];

  // Utility pages first — so they show up at top of empty state
  items.push({
    id: 'page-home',
    kind: 'page',
    title: 'Home',
    subtitle: 'Voltar à página inicial',
    icon: '🏠',
    href: '/',
    haystack: 'home inicio inicial start landing',
    accent: 'var(--ffv-muted)',
  });
  items.push({
    id: 'page-progresso',
    kind: 'page',
    title: 'Progresso',
    subtitle: 'Seu dashboard completo — XP, streak, badges, por hub',
    icon: '📊',
    href: '/progresso',
    haystack: 'progresso dashboard xp streak badge nivel level',
    accent: 'var(--ffv-green)',
  });
  items.push({
    id: 'page-revisar',
    kind: 'page',
    title: 'Revisar',
    subtitle: 'Fila de revisão espaçada (SRS)',
    icon: '🧠',
    href: '/revisar',
    haystack: 'revisar srs spaced repetition flashcards cards',
    accent: 'var(--ffv-green)',
  });

  // Hubs
  for (const hub of HUBS) {
    items.push({
      id: `hub-${hub.slug}`,
      kind: 'hub',
      title: hub.name,
      subtitle: hub.tagline,
      icon: hub.icon,
      href: hub.href,
      haystack: `${hub.name} ${hub.shortName} ${hub.tagline} ${hub.desc}`.toLowerCase(),
      accent: hub.color,
    });
  }

  // Trails
  for (const trail of CURRICULUM) {
    items.push({
      id: `trail-${trail.id}`,
      kind: 'trail',
      title: trail.name,
      subtitle: trail.desc,
      icon: trail.icon,
      href: getTrailHref(trail.id),
      haystack: `${trail.name} ${trail.desc} ${trail.id}`.toLowerCase(),
      accent: trail.color,
    });
  }

  // Articles
  for (const trail of CURRICULUM) {
    for (const mod of trail.modules) {
      items.push({
        id: `art-${mod.slug}`,
        kind: 'article',
        title: mod.title,
        subtitle: `${trail.name} · ${mod.readTime} min · +${mod.xp} XP`,
        icon: mod.icon,
        href: `/aprenda/${mod.slug}`,
        haystack: `${mod.title} ${mod.desc} ${mod.keywords} ${trail.name} ${mod.slug}`.toLowerCase(),
        accent: trail.color,
      });
    }
  }
  return items;
}

/** Cheap fuzzy match: every whitespace-split term must appear in haystack; score by closeness. */
function score(query: string, item: Item): number {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/).filter(Boolean);
  let score = 0;
  const hay = item.haystack;
  const title = item.title.toLowerCase();

  for (const t of terms) {
    if (!hay.includes(t)) return -1;
    if (title.startsWith(t)) score += 100;
    else if (title.includes(t)) score += 50;
    score += 5;
  }
  // Kind boost — hubs & pages float up in empty-ish queries
  if (item.kind === 'hub') score += 8;
  else if (item.kind === 'page') score += 6;
  else if (item.kind === 'trail') score += 4;
  return score;
}

const KIND_LABEL: Record<Item['kind'], string> = {
  hub: 'Hub',
  trail: 'Trilha',
  article: 'Artigo',
  page: 'Página',
};

function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/.test(navigator.platform));
  }, []);
  return isMac;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const items = useMemo(() => buildItems(), []);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Empty state: recommended order — pages, hubs, top trails, recent-ish articles
      return items.slice(0, 50);
    }
    const scored = items
      .map(it => ({ it, s: score(query, it) }))
      .filter(x => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 30);
    return scored.map(x => x.it);
  }, [query, items]);

  // Reset active on query change
  useEffect(() => {
    setActive(0);
  }, [query]);

  // Global hotkey
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isK = e.key === 'k' || e.key === 'K';
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === '/' && !open) {
        const tag = (document.activeElement?.tagName ?? '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          setOpen(true);
        }
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Focus input when opened; reset state on close
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keep active row in view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  // Expose trigger to window for HUD button
  useEffect(() => {
    type W = Window & { __ffvOpenPalette?: () => void };
    (window as W).__ffvOpenPalette = () => setOpen(true);
    return () => {
      (window as W).__ffvOpenPalette = undefined;
    };
  }, []);

  function onListKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const it = filtered[active];
      if (it) {
        setOpen(false);
        router.push(it.href);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar no FFV Academy"
      className="fixed inset-0 z-[100] flex items-start justify-center px-4"
      style={{
        paddingTop: 'min(12vh, 120px)',
        background: 'color-mix(in srgb, #000 60%, transparent)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{
          background: 'var(--ffv-bg)',
          border: '1px solid var(--ffv-border)',
          boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
        }}
      >
        <div className="flex items-center gap-3 px-4" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onListKeyDown}
            placeholder="Buscar artigos, trilhas, hubs, páginas…"
            className="flex-1 bg-transparent outline-none text-sm py-3.5"
            style={{ color: 'var(--foreground)' }}
            aria-label="Campo de busca"
          />
          <kbd
            className="font-mono"
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--ffv-border)',
              color: 'var(--ffv-muted)',
              background: 'var(--ffv-bg3)',
            }}
          >
            ESC
          </kbd>
        </div>

        <div
          ref={listRef}
          className="overflow-y-auto"
          style={{ maxHeight: 'min(60vh, 480px)' }}
        >
          {filtered.length === 0 ? (
            <div
              className="px-5 py-10 text-center text-sm"
              style={{ color: 'var(--ffv-muted)' }}
            >
              Nenhum resultado para “{query}”.
            </div>
          ) : (
            <GroupedResults items={filtered} active={active} onHover={setActive} onPick={(it) => { setOpen(false); router.push(it.href); }} />
          )}
        </div>

        <div
          className="flex items-center justify-between px-4 py-2 text-[11px] font-mono"
          style={{
            borderTop: '1px solid var(--ffv-border)',
            color: 'var(--ffv-muted)',
            background: 'var(--ffv-bg2)',
          }}
        >
          <div className="flex items-center gap-3">
            <LegendKey label="navegar">↑↓</LegendKey>
            <LegendKey label="abrir">↵</LegendKey>
          </div>
          <span>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}

function GroupedResults({
  items,
  active,
  onHover,
  onPick,
}: {
  items: Item[];
  active: number;
  onHover: (i: number) => void;
  onPick: (it: Item) => void;
}) {
  // Group by kind — consolidate all items of the same kind into one group,
  // preserving first-appearance order so scores still drive top result.
  const groupOrder: Item['kind'][] = [];
  const groupMap = new Map<Item['kind'], { it: Item; idx: number }[]>();
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!groupMap.has(it.kind)) {
      groupOrder.push(it.kind);
      groupMap.set(it.kind, []);
    }
    groupMap.get(it.kind)!.push({ it, idx: i });
  }
  const groups = groupOrder.map(kind => ({
    kind,
    label: KIND_LABEL[kind] + 's',
    items: groupMap.get(kind)!,
  }));
  return (
    <div className="py-1.5">
      {groups.map(g => (
        <div key={g.kind}>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 10,
              color: 'var(--ffv-muted)',
              letterSpacing: '0.14em',
              padding: '8px 16px 4px',
            }}
          >
            {g.label}
          </div>
          {g.items.map(({ it, idx }) => (
            <Row
              key={it.id}
              item={it}
              idx={idx}
              active={idx === active}
              onMouseEnter={() => onHover(idx)}
              onClick={() => onPick(it)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Row({
  item,
  idx,
  active,
  onMouseEnter,
  onClick,
}: {
  item: Item;
  idx: number;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-idx={idx}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors"
      style={{
        background: active ? 'var(--ffv-bg2)' : 'transparent',
        borderLeft: `2px solid ${active ? item.accent : 'transparent'}`,
        cursor: 'pointer',
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: `color-mix(in srgb, ${item.accent} 14%, transparent)`,
          border: `1px solid color-mix(in srgb, ${item.accent} 28%, transparent)`,
          fontSize: 14,
        }}
      >
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}
        >
          {item.title}
        </div>
        {item.subtitle && (
          <div
            className="truncate"
            style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 2 }}
          >
            {item.subtitle}
          </div>
        )}
      </div>
      {active && (
        <span
          className="font-mono"
          style={{ fontSize: 11, color: item.accent, fontWeight: 700 }}
        >
          ↵
        </span>
      )}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--ffv-muted)', flexShrink: 0 }}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}

function LegendKey({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd
        style={{
          fontSize: 10,
          padding: '1px 5px',
          borderRadius: 3,
          border: '1px solid var(--ffv-border)',
          background: 'var(--ffv-bg3)',
          color: 'var(--ffv-muted)',
        }}
      >
        {children}
      </kbd>
      <span>{label}</span>
    </span>
  );
}

/** Exported button that opens the palette — used in the HUD. */
export function CommandPaletteTrigger() {
  const isMac = useIsMac();
  function open() {
    type W = Window & { __ffvOpenPalette?: () => void };
    (window as W).__ffvOpenPalette?.();
  }
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Buscar no Hub"
      className="inline-flex items-center gap-2 rounded-md transition-colors"
      style={{
        height: 32,
        padding: '0 10px 0 10px',
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        color: 'var(--ffv-muted)',
        fontSize: 12,
        cursor: 'pointer',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = 'var(--ffv-blue)';
        e.currentTarget.style.color = 'var(--foreground)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'var(--ffv-border)';
        e.currentTarget.style.color = 'var(--ffv-muted)';
      }}
    >
      <SearchIcon />
      <span className="hidden md:inline">Buscar</span>
      <kbd
        className="font-mono hidden sm:inline"
        style={{
          fontSize: 10,
          padding: '1px 5px',
          borderRadius: 3,
          border: '1px solid var(--ffv-border)',
          background: 'var(--ffv-bg3)',
          color: 'var(--ffv-muted)',
          lineHeight: 1,
        }}
      >
        {isMac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </button>
  );
}
