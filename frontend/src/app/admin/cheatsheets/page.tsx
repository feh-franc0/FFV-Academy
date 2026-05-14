'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { deleteCheatsheet } from '@/lib/admin-content-api';

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
  const [items, setItems] = useState<CheatsheetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!API_BASE) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/cheatsheets`);
      if (res.ok) {
        const body = (await res.json()) as { data?: CheatsheetItem[] };
        setItems(body.data ?? []);
      }
    } catch {
      // backend offline
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(slug: string) {
    if (!confirm(`Apagar cheatsheet "${slug}"?`)) return;
    const ok = await deleteCheatsheet(slug);
    if (ok) load();
  }

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cheatsheets</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {loading ? 'Carregando…' : `${items.length} cheatsheets`}
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
            {!loading && items.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-4 text-center" style={{ color: 'var(--ffv-muted)' }}>Nenhum cheatsheet.</td></tr>
            )}
            {items.map((c, i) => (
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
    </div>
  );
}
