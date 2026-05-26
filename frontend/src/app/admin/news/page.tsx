'use client';

/**
 * /admin/news — lista + criação rápida. Edição inline em cada linha (drawer
 * abre embaixo). Versão MVP — refina depois conforme uso.
 */
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { deleteNews } from '@/lib/admin-content-api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

interface NewsItem {
  slug: string;
  title: string;
  source: string;
  category: string;
  hot: boolean;
  publishedAt: string;
  status: string;
}

const PAGE_SIZE = 50;

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    if (!API_BASE) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/news?limit=${PAGE_SIZE}&offset=0`);
      if (res.ok) {
        const body = (await res.json()) as { data?: NewsItem[]; total?: number };
        setItems(body.data ?? []);
        setTotal(body.total ?? 0);
      }
    } catch {
      // backend offline
    }
    setLoading(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !API_BASE) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/news?limit=${PAGE_SIZE}&offset=${items.length}`);
      if (res.ok) {
        const body = (await res.json()) as { data?: NewsItem[]; total?: number };
        setItems(prev => [...prev, ...(body.data ?? [])]);
        if (typeof body.total === 'number') setTotal(body.total);
      }
    } catch {
      // backend offline
    }
    setLoadingMore(false);
  }, [items.length, loadingMore]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(slug: string) {
    if (!confirm(`Apagar a news "${slug}"?`)) return;
    const ok = await deleteNews(slug);
    if (ok) load();
  }

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">News</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {loading ? 'Carregando…' : `${items.length} de ${total} notícias`}
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={{ background: 'var(--ffv-blue)', color: 'white' }}
        >
          + Nova notícia
        </Link>
      </header>

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--ffv-border)' }}>
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--ffv-bg2)' }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Slug</th>
              <th className="px-3 py-2 text-left font-semibold">Título</th>
              <th className="px-3 py-2 text-left font-semibold">Fonte</th>
              <th className="px-3 py-2 text-left font-semibold">Categoria</th>
              <th className="px-3 py-2 text-left font-semibold">Data</th>
              <th className="px-3 py-2 text-left font-semibold">Hot</th>
              <th className="px-3 py-2 text-left font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center" style={{ color: 'var(--ffv-muted)' }}>
                  Nenhuma notícia.
                </td>
              </tr>
            )}
            {items.map((n, i) => (
              <tr key={n.slug} style={{
                borderBottom: '1px solid var(--ffv-border)',
                background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)',
              }}>
                <td className="px-3 py-2 font-mono">{n.slug}</td>
                <td className="px-3 py-2 max-w-md truncate">{n.title}</td>
                <td className="px-3 py-2">{n.source}</td>
                <td className="px-3 py-2"><span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--ffv-bg2)' }}>{n.category}</span></td>
                <td className="px-3 py-2 font-mono">{n.publishedAt}</td>
                <td className="px-3 py-2">{n.hot ? '🔥' : '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Link href={`/admin/news/edit?slug=${encodeURIComponent(n.slug)}`} className="underline mr-3" style={{ color: 'var(--ffv-blue)' }}>Editar</Link>
                  <button onClick={() => handleDelete(n.slug)} className="underline" style={{ color: 'var(--ffv-red, #dc2626)' }}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length < total && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', cursor: 'pointer' }}
          >
            {loadingMore ? 'Carregando…' : `Carregar mais (${total - items.length} restantes)`}
          </button>
        </div>
      )}
    </div>
  );
}
