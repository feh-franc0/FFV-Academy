/**
 * /admin/curriculum — lista os 765 artigos com filtro de busca rápida.
 *
 * Link pra view pública. Edição inline ainda não — Sprint 6 (editor real).
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { BigNumberCard } from '@/components/admin/BigNumberCard';

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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Paginação real backend — sempre busca a página atual. Busca local
  // (search) filtra apenas dentro da página exibida (limitação consciente —
  // search server-side fica pra quando o backend expor /curriculum/search
  // com paginação consistente).
  useEffect(() => {
    let cancelled = false;
    async function loadPage() {
      setLoading(true);
      try {
        const res = await apiFetch<ListResponse>(
          `/api/v1/curriculum?limit=${pageSize}&offset=${page * pageSize}`,
          {},
          true,
        );
        if (!cancelled && res) {
          setItems(res.data ?? []);
          setTotal(res.total ?? 0);
        }
      } catch {
        // backend offline
      }
      if (!cancelled) setLoading(false);
    }
    void loadPage();
    return () => { cancelled = true; };
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i => i.slug.toLowerCase().includes(q) || i.title.toLowerCase().includes(q));
  }, [items, search]);

  // Stats client-side da página atual pra big numbers (proxy razoável até
  // termos endpoint dedicado de stats).
  const stats = useMemo(() => {
    const trails = new Set(items.map(i => i.trail_id).filter(Boolean));
    const hubs = new Set(items.map(i => i.hub_id).filter(Boolean));
    return {
      trails: trails.size,
      hubs: hubs.size,
    };
  }, [items]);

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Currículo</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          {loading
            ? 'Carregando…'
            : `Página ${page + 1} · mostrando ${items.length} de ${total.toLocaleString('pt-BR')} artigos no total`}
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigNumberCard label="Artigos no total" value={total} hint="curriculum publicado" />
        <BigNumberCard label="Nesta página" value={items.length} hint={`${pageSize} por página`} />
        <BigNumberCard label="Trilhas (nesta página)" value={stats.trails} hint="trilhas distintas" />
        <BigNumberCard label="Hubs (nesta página)" value={stats.hubs} hint="hubs distintos" />
      </section>

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
            Mostrando 200 de {filtered.length} (após filtro local). Refine a busca pra ver outros.
          </p>
        )}
      </div>

      <AdminPagination
        total={total}
        page={page}
        pageSize={pageSize}
        onPage={setPage}
        onPageSize={ps => { setPage(0); setPageSize(ps); }}
      />
    </div>
  );
}
