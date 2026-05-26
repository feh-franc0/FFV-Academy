'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { deleteCheatsheet } from '@/lib/admin-content-api';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { BigNumberCard } from '@/components/admin/BigNumberCard';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

interface CheatsheetItem {
  slug: string;
  title: string;
  subtitle?: string;
  accent: string;
  emoji?: string;
  order: number;
}

export default function AdminCheatsheetsPage() {
  // Endpoint /api/v1/cheatsheets retorna array simples (sem envelope). Paginação
  // é client-side aqui (volume real = dezenas; backend tem LIMIT 500 defensivo).
  // Big numbers usam o conjunto completo carregado.
  const [allItems, setAllItems] = useState<CheatsheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!API_BASE) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE}/api/v1/cheatsheets`);
        if (res.ok && !cancelled) {
          const body = await res.json();
          // Aceita tanto { data: [...] } quanto array bruto pra compat.
          const arr: CheatsheetItem[] = Array.isArray(body) ? body : (body?.data ?? []);
          setAllItems(arr);
        }
      } catch {
        // backend offline
      }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const total = allItems.length;
  const visible = useMemo(
    () => allItems.slice(page * pageSize, (page + 1) * pageSize),
    [allItems, page, pageSize],
  );
  const stats = useMemo(() => {
    const accents = new Set(allItems.map(c => c.accent).filter(Boolean));
    const withEmoji = allItems.filter(c => !!c.emoji).length;
    return { accents: accents.size, withEmoji };
  }, [allItems]);

  async function handleDelete(slug: string) {
    if (!confirm(`Apagar cheatsheet "${slug}"?`)) return;
    const ok = await deleteCheatsheet(slug);
    if (ok) setAllItems(prev => prev.filter(c => c.slug !== slug));
  }

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cheatsheets</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {loading ? 'Carregando…' : `Página ${page + 1} · ${visible.length} de ${total} cheatsheets`}
          </p>
        </div>
        <Link
          href="/admin/cheatsheets/edit"
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={{ background: 'var(--ffv-blue)', color: 'white' }}
        >
          + Novo cheatsheet
        </Link>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigNumberCard label="Cheatsheets no total" value={total} hint="publicados" />
        <BigNumberCard label="Nesta página" value={visible.length} hint={`${pageSize} por página`} />
        <BigNumberCard label="Com emoji" value={stats.withEmoji} hint="cheatsheets visuais" />
        <BigNumberCard label="Cores distintas" value={stats.accents} hint="paleta de accents" />
      </section>

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--ffv-border)' }}>
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--ffv-bg2)' }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Slug</th>
              <th className="px-3 py-2 text-left font-semibold">Título</th>
              <th className="px-3 py-2 text-left font-semibold">Order</th>
              <th className="px-3 py-2 text-left font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!loading && total === 0 && (
              <tr><td colSpan={4} className="px-3 py-4 text-center" style={{ color: 'var(--ffv-muted)' }}>Nenhum cheatsheet.</td></tr>
            )}
            {visible.map((c, i) => (
              <tr key={c.slug} style={{ borderBottom: '1px solid var(--ffv-border)', background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)' }}>
                <td className="px-3 py-2 font-mono">{c.slug}</td>
                <td className="px-3 py-2">{c.emoji} {c.title}</td>
                <td className="px-3 py-2">{c.order}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Link href={`/cheatsheets/${c.slug}`} className="underline mr-3" target="_blank" style={{ color: 'var(--ffv-muted)' }}>Ver</Link>
                  <Link href={`/admin/cheatsheets/edit?slug=${encodeURIComponent(c.slug)}`} className="underline mr-3" style={{ color: 'var(--ffv-blue)' }}>Editar</Link>
                  <button onClick={() => handleDelete(c.slug)} className="underline" style={{ color: 'var(--ffv-red, #dc2626)' }}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
