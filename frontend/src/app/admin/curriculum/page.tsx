/**
 * /admin/curriculum — lista os 765 artigos com filtro de busca rápida.
 *
 * Link pra view pública. Edição inline ainda não — Sprint 6 (editor real).
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

interface ArticleItem {
  slug: string;
  title: string;
  trail_id: string;
  hub_id: string;
  xp: number;
  read_time: number;
  difficulty: string;
}

interface ListResponse {
  data: ArticleItem[];
  total: number;
}

export default function AdminCurriculumPage() {
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      const out: ArticleItem[] = [];
      try {
        for (let offset = 0; offset < 50; offset++) {
          const res = await apiFetch<ListResponse>(`/api/v1/curriculum?limit=100&offset=${offset * 100}`, {}, true);
          if (!res?.data?.length) break;
          out.push(...res.data);
          if (res.data.length < 100) break;
        }
      } catch {
        // backend offline
      }
      if (!cancelled) {
        setItems(out);
        setLoading(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i => i.slug.toLowerCase().includes(q) || i.title.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Currículo</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          {loading ? 'Carregando…' : `${items.length.toLocaleString('pt-BR')} artigos no banco`}
        </p>
      </header>

      <input
        type="text"
        placeholder="Buscar slug ou título…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-md px-3 py-2 rounded-md text-sm"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
      />

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--ffv-border)' }}>
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--ffv-bg2)' }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Slug</th>
              <th className="px-3 py-2 text-left font-semibold">Título</th>
              <th className="px-3 py-2 text-left font-semibold">Trail</th>
              <th className="px-3 py-2 text-left font-semibold">Hub</th>
              <th className="px-3 py-2 text-left font-semibold">XP</th>
              <th className="px-3 py-2 text-left font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((a, i) => (
              <tr
                key={a.slug}
                style={{
                  borderBottom: '1px solid var(--ffv-border)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)',
                }}
              >
                <td className="px-3 py-2 font-mono">{a.slug}</td>
                <td className="px-3 py-2">{a.title}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{a.trail_id}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{a.hub_id}</td>
                <td className="px-3 py-2">{a.xp}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <a href={`/aprenda/${a.slug}/`} className="underline mr-3" style={{ color: 'var(--ffv-blue)' }}>
                    Ver
                  </a>
                  <a href={`/admin/curriculum/edit?slug=${encodeURIComponent(a.slug)}`} className="underline" style={{ color: 'var(--ffv-blue)' }}>
                    Editar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 200 && (
          <p className="p-3 text-xs" style={{ color: 'var(--ffv-muted)' }}>
            Mostrando 200 de {filtered.length}. Refine a busca pra ver outros.
          </p>
        )}
      </div>
    </div>
  );
}
