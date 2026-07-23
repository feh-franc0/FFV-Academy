'use client';

/**
 * Trending — top módulos mais lidos nos últimos 7 dias DENTRO da base ativa.
 *
 * Antes da correção 2026-05-21, o componente fazia fetch global e mostrava
 * módulos de tecnologia (IA, AWS) na home da medvet — vazamento de base. Agora:
 *
 *   1. Fetch traz top-N global (cache 5min no servidor).
 *   2. Filtramos client-side: só itens cujo slug pertence à base ativa
 *      (resolvido por getBaseSlugForModule).
 *   3. Se sobrarem < 3 itens, escondemos a seção em vez de mostrar uma grade
 *      semi-vazia ou cross-base.
 *
 * Próxima evolução (Fase 4): backend aceitar `?base=<slug>` no endpoint
 * `/curriculum/trending` e devolver já filtrado, evitando o overfetch.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useActiveBase } from '@/components/base/ActiveBaseContext';
import { getBaseSlugForModule } from '@/lib/bases/module-base-resolver';
import { DEFAULT_BASE_SLUG } from '@/lib/bases/registry';

interface TrendingItem {
  slug: string;
  title: string;
  trailId?: string;
  hubId?: string;
  views: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function moduleHref(slug: string, baseSlug: string, basePath: string): string {
  // Módulos da default base (tech) vivem em /aprenda/<slug>; módulos de
  // outras bases moram em /{basePath}/<slug>. O resolver já sabe a base do
  // slug, mas aqui o item já passou pelo filtro — pertence à base ativa.
  if (baseSlug === DEFAULT_BASE_SLUG) return `/aprenda/${slug}/`;
  return `${basePath}/${slug}`;
}

export function Trending() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { base: activeBase } = useActiveBase();

  useEffect(() => {
    if (!API_BASE) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/v1/curriculum/trending?window=7d&limit=24`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (cancelled || !json?.data) return;
        const all = json.data as TrendingItem[];
        // Filtra pela base ativa — slug desconhecido vai pra default (tech),
        // mantendo retrocompat.
        const isDefault = activeBase.slug === DEFAULT_BASE_SLUG;
        const filtered = all.filter(it => {
          const b = getBaseSlugForModule(it.slug);
          if (b === activeBase.slug) return true;
          if (isDefault && b === null) return true;
          return false;
        });
        setItems(filtered.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [activeBase.slug]);

  // Esconde a seção quando não há dados suficientes pra base atual.
  // Antes de 2026-05-21 mostrava tudo cross-base — agora prefere sumir
  // a vazar conteúdo de outra área temática.
  if (!loaded || items.length < 3) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Em alta esta semana</h2>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Módulos mais lidos pela comunidade nos últimos 7 dias.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((it, i) => (
          <Link
            key={it.slug}
            href={moduleHref(it.slug, activeBase.slug, activeBase.basePath || `/${activeBase.slug}`)}
            className="p-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--ffv-bg2)',
              border: '1px solid var(--ffv-border)',
            }}
          >
            <div
              className="text-xs font-bold mb-2"
              style={{ color: 'var(--ffv-blue)' }}
            >
              #{i + 1} · {it.views.toLocaleString('pt-BR')} views
            </div>
            <h3 className="text-sm font-semibold leading-snug">{it.title}</h3>
            {it.trailId && (
              <p className="text-xs mt-2 font-mono" style={{ color: 'var(--ffv-muted)' }}>
                {it.trailId}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
