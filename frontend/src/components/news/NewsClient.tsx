'use client';

import { useMemo, useState } from 'react';
import {
  CATEGORY_LABEL,
  NEWS_CATEGORIES,
  filterByCategory,
  filterBySource,
  uniqueSources,
  type NewsCategory,
  type NewsItem,
} from '@/lib/news';
import { NewsCard } from './NewsCard';

type TimeWindow = 'week' | 'month' | 'all';

function windowDays(w: TimeWindow): number | null {
  if (w === 'week') return 7;
  if (w === 'month') return 30;
  return null;
}

function withinWindow(item: NewsItem, days: number | null, now: Date): boolean {
  if (days == null) return true;
  const then = new Date(item.publishedAt + 'T00:00:00Z');
  const diffDays = (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

export function NewsClient({ items }: { items: NewsItem[] }) {
  const [source, setSource] = useState<string | null>(null);
  const [category, setCategory] = useState<NewsCategory | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all');

  const sources = useMemo(() => uniqueSources(items), [items]);

  const filtered = useMemo(() => {
    const now = new Date();
    const days = windowDays(timeWindow);
    let out = items.filter(i => withinWindow(i, days, now));
    out = filterBySource(out, source);
    out = filterByCategory(out, category);
    return out;
  }, [items, source, category, timeWindow]);

  const hotItems = useMemo(() => filtered.filter(i => i.hot), [filtered]);
  const restItems = useMemo(() => filtered.filter(i => !i.hot), [filtered]);

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-col gap-3 mb-8">
        <FilterRow label="Período">
          <Chip active={timeWindow === 'week'} onClick={() => setTimeWindow('week')}>Esta semana</Chip>
          <Chip active={timeWindow === 'month'} onClick={() => setTimeWindow('month')}>Mês</Chip>
          <Chip active={timeWindow === 'all'} onClick={() => setTimeWindow('all')}>Tudo</Chip>
        </FilterRow>

        <FilterRow label="Categoria">
          <Chip active={category === null} onClick={() => setCategory(null)}>Todas</Chip>
          {NEWS_CATEGORIES.map(c => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Fonte">
          <Chip active={source === null} onClick={() => setSource(null)}>Todas</Chip>
          {sources.map(s => (
            <Chip key={s} active={source === s} onClick={() => setSource(s)}>
              {s}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center text-sm"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px dashed var(--ffv-border)',
            color: 'var(--ffv-muted)',
          }}
        >
          Nenhuma notícia no filtro atual. Ajuste período, categoria ou fonte.
        </div>
      ) : (
        <>
          {hotItems.length > 0 && (
            <section className="mb-10">
              <SectionHeading label="🔥 Destaques" count={hotItems.length} />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {hotItems.map(item => (
                  <NewsCard key={item.id} item={item} emphasis="hot" />
                ))}
              </div>
            </section>
          )}

          <section>
            {hotItems.length > 0 && <SectionHeading label="Todas as notícias" count={restItems.length} />}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {restItems.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="text-[11px] font-mono uppercase tracking-wider mr-1"
        style={{ color: 'var(--ffv-muted)', minWidth: 70 }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
      style={{
        background: active ? 'color-mix(in srgb, var(--ffv-blue) 16%, transparent)' : 'var(--ffv-bg2)',
        border: `1px solid ${active ? 'color-mix(in srgb, var(--ffv-blue) 42%, transparent)' : 'var(--ffv-border)'}`,
        color: active ? 'var(--ffv-blue)' : 'var(--ffv-muted)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function SectionHeading({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="text-lg font-bold">{label}</h2>
      <span className="text-xs font-mono" style={{ color: 'var(--ffv-muted)' }}>
        {count} {count === 1 ? 'notícia' : 'notícias'}
      </span>
    </div>
  );
}
