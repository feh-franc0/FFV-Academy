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

  // Hero é o primeiro hot, ou (se não houver hot) o primeiro do filtro.
  const hero = useMemo(() => filtered.find(i => i.hot) ?? filtered[0], [filtered]);
  const otherHot = useMemo(
    () => filtered.filter(i => i.hot && i.id !== hero?.id).slice(0, 4),
    [filtered, hero],
  );
  const restItems = useMemo(
    () => filtered.filter(i => i.id !== hero?.id && !otherHot.some(h => h.id === i.id)),
    [filtered, hero, otherHot],
  );

  return (
    <div>
      {/* Filtros — design refinado em pílulas */}
      <div className="flex flex-col gap-4 mb-10">
        <FilterRow label="Período">
          <Chip active={timeWindow === 'week'} onClick={() => setTimeWindow('week')}>
            Esta semana
          </Chip>
          <Chip active={timeWindow === 'month'} onClick={() => setTimeWindow('month')}>
            Mês
          </Chip>
          <Chip active={timeWindow === 'all'} onClick={() => setTimeWindow('all')}>
            Tudo
          </Chip>
        </FilterRow>

        <FilterRow label="Categoria">
          <Chip active={category === null} onClick={() => setCategory(null)}>
            Todas
          </Chip>
          {NEWS_CATEGORIES.map(c => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Fonte">
          <Chip active={source === null} onClick={() => setSource(null)}>
            Todas
          </Chip>
          {sources.map(s => (
            <Chip key={s} active={source === s} onClick={() => setSource(s)}>
              {s}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px dashed var(--ffv-border)',
            color: 'var(--ffv-muted)',
          }}
        >
          <div className="text-3xl mb-3">📭</div>
          <p className="text-sm">Nenhuma notícia no filtro atual. Ajuste período, categoria ou fonte.</p>
        </div>
      ) : (
        <>
          {/* Hero — destaque editorial em 100% width */}
          {hero && (
            <section className="mb-10">
              <SectionHeading label="🔥 Manchete da semana" />
              <NewsCard item={hero} emphasis="hero" />
            </section>
          )}

          {/* Outros hot — grid 2 colunas em desktop */}
          {otherHot.length > 0 && (
            <section className="mb-12">
              <SectionHeading label="Em destaque" count={otherHot.length} />
              <div className="grid gap-5 md:grid-cols-2">
                {otherHot.map(item => (
                  <NewsCard key={item.id} item={item} emphasis="hot" />
                ))}
              </div>
            </section>
          )}

          {/* Resto — grid 3 colunas */}
          {restItems.length > 0 && (
            <section>
              <SectionHeading label="Todas as notícias" count={restItems.length} />
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {restItems.map(item => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 ffv-scroll-x-mask flex-nowrap md:flex-wrap">
      <span
        className="text-[11px] font-mono uppercase tracking-wider mr-2"
        style={{ color: 'var(--ffv-muted)', minWidth: 70, letterSpacing: '0.08em' }}
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
      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={{
        background: active
          ? 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))'
          : 'var(--ffv-bg2)',
        border: `1px solid ${active ? 'transparent' : 'var(--ffv-border)'}`,
        color: active ? '#fff' : 'var(--ffv-muted)',
        cursor: 'pointer',
        boxShadow: active ? '0 4px 12px -4px color-mix(in srgb, var(--ffv-blue) 50%, transparent)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

function SectionHeading({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-baseline justify-between mb-5">
      <h2
        className="font-bold"
        style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </h2>
      {count !== undefined && (
        <span
          className="text-xs font-mono"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.04em' }}
        >
          {count} {count === 1 ? 'notícia' : 'notícias'}
        </span>
      )}
    </div>
  );
}
