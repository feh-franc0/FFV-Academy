'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { deletePlaylist } from '@/lib/admin-content-api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

interface PlaylistItem {
  slug: string;
  title: string;
  moduleSlugs: string[];
  order: number;
  emoji?: string;
}

export default function AdminPlaylistsPage() {
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!API_BASE) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/playlists`);
      if (res.ok) {
        const body = (await res.json()) as { data?: PlaylistItem[] };
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
    if (!confirm(`Apagar playlist "${slug}"?`)) return;
    const ok = await deletePlaylist(slug);
    if (ok) load();
  }

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Playlists</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {loading ? 'Carregando…' : `${items.length} playlists`}
          </p>
        </div>
        <Link
          href="/admin/playlists/edit"
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
        >
          + Nova playlist
        </Link>
      </header>
      <div tabIndex={0} role="group" aria-label="Tabela, rolável na horizontal" className="rounded-xl overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ffv-blue)]" style={{ border: '1px solid var(--ffv-border)' }}>
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--ffv-bg2)' }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Slug</th>
              <th className="px-3 py-2 text-left font-semibold">Título</th>
              <th className="px-3 py-2 text-left font-semibold">Módulos</th>
              <th className="px-3 py-2 text-left font-semibold">Order</th>
              <th className="px-3 py-2 text-left font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-4 text-center" style={{ color: 'var(--ffv-muted)' }}>Nenhuma playlist.</td></tr>
            )}
            {items.map((p, i) => (
              <tr key={p.slug} style={{ borderBottom: '1px solid var(--ffv-border)', background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)' }}>
                <td className="px-3 py-2 font-mono">{p.slug}</td>
                <td className="px-3 py-2">{p.emoji} {p.title}</td>
                <td className="px-3 py-2 font-mono">{p.moduleSlugs.length}</td>
                <td className="px-3 py-2">{p.order}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Link href={`/admin/playlists/edit?slug=${encodeURIComponent(p.slug)}`} className="underline mr-3" style={{ color: 'var(--ffv-blue)' }}>Editar</Link>
                  <button onClick={() => handleDelete(p.slug)} className="underline" style={{ color: 'var(--ffv-red, #dc2626)' }}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
