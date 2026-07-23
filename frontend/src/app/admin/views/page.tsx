'use client';

/**
 * /admin/views — feed em tempo real de "quem acessou o quê".
 *
 * Decisão de produto (2026-05-21): admin precisa ver cada pageview com:
 *   - Quando aconteceu
 *   - Quem (email se logado; "Visitante anônimo (anon-xxxx)" caso contrário)
 *   - O quê (slug do módulo OU path da página global)
 *   - Onde (base de conhecimento)
 *   - Categoria (module | page | simulado | admin | other)
 *
 * Filtros UI: base, kind, email do usuário, slug, período (24h / 7d / 30d).
 *
 * Limitações conhecidas:
 *   - Janela máxima 30d e limit máx 200 (definido no backend).
 *   - Sem paginação infinita — busque mais específico se precisar.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchAdminViews, type ViewEntry, type ViewKind } from '@/lib/admin-api';

const KIND_OPTIONS: { value: ViewKind | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'module', label: 'Módulo' },
  { value: 'page', label: 'Página' },
  { value: 'simulado', label: 'Simulado' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Outro' },
];

const PERIOD_OPTIONS: { hours: number; label: string }[] = [
  { hours: 1, label: '1h' },
  { hours: 24, label: '24h' },
  { hours: 24 * 7, label: '7d' },
  { hours: 24 * 30, label: '30d' },
];

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s atrás`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const days = Math.floor(h / 24);
  return `${days}d atrás`;
}

function kindBadge(kind: ViewKind): { bg: string; color: string; emoji: string } {
  switch (kind) {
    case 'module':   return { bg: '#1e3a8a20', color: '#1e3a8a', emoji: '📖' };
    case 'simulado': return { bg: '#b4530920', color: '#b45309', emoji: '🎯' };
    case 'admin':    return { bg: '#dc262620', color: '#dc2626', emoji: '🛡️' };
    case 'page':     return { bg: '#15803d20', color: '#15803d', emoji: '📄' };
    default:         return { bg: '#57534e20', color: '#57534e', emoji: '·' };
  }
}

function baseBadge(slug?: string): string {
  if (!slug) return 'sem base';
  if (slug === 'tecnologia') return 'Tecnologia';
  if (slug === 'medicina-veterinaria') return 'Medicina Vet';
  return slug;
}

export default function AdminViewsPage() {
  const [views, setViews] = useState<ViewEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Filtros
  const [baseFilter, setBaseFilter] = useState('');
  const [kindFilter, setKindFilter] = useState<ViewKind | ''>('');
  const [userFilter, setUserFilter] = useState('');
  const [slugFilter, setSlugFilter] = useState('');
  const [hours, setHours] = useState(24);

  const load = useCallback(() => {
    setLoading(true);
    setErr(null);
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    fetchAdminViews({
      base: baseFilter || undefined,
      kind: kindFilter || undefined,
      user: userFilter || undefined,
      slug: slugFilter || undefined,
      since,
      limit: 200,
    })
      .then(resp => {
        if (!resp) {
          setErr('Falha ao carregar (backend offline?)');
          setViews([]);
          return;
        }
        setViews(resp.views);
      })
      .finally(() => setLoading(false));
  }, [baseFilter, kindFilter, userFilter, slugFilter, hours]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Acessos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ffv-muted)' }}>
          Feed em tempo real de quem acessou cada módulo. Logados aparecem por
          email; visitantes ficam como "Anônimo (id curto)".
        </p>
      </header>

      {/* Filtros */}
      <section
        className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 p-4 rounded-xl"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold" style={{ color: 'var(--ffv-muted)' }}>Base</span>
          <select
            value={baseFilter}
            onChange={e => setBaseFilter(e.target.value)}
            className="px-2 py-1.5 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
          >
            <option value="">Todas</option>
            <option value="tecnologia">Tecnologia</option>
            <option value="medicina-veterinaria">Medicina Veterinária</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold" style={{ color: 'var(--ffv-muted)' }}>Tipo</span>
          <select
            value={kindFilter}
            onChange={e => setKindFilter(e.target.value as ViewKind | '')}
            className="px-2 py-1.5 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
          >
            {KIND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold" style={{ color: 'var(--ffv-muted)' }}>E-mail</span>
          <input
            type="text"
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            placeholder="usuario@dominio"
            className="px-2 py-1.5 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold" style={{ color: 'var(--ffv-muted)' }}>Slug</span>
          <input
            type="text"
            value={slugFilter}
            onChange={e => setSlugFilter(e.target.value)}
            placeholder="postgres-mvcc"
            className="px-2 py-1.5 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold" style={{ color: 'var(--ffv-muted)' }}>Período</span>
          <select
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
            className="px-2 py-1.5 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
          >
            {PERIOD_OPTIONS.map(o => <option key={o.hours} value={o.hours}>{o.label}</option>)}
          </select>
        </label>
      </section>

      <div className="mb-3 flex items-center justify-between text-sm">
        <span style={{ color: 'var(--ffv-muted)' }}>
          {loading ? 'Carregando…' : `${views.length} acesso${views.length === 1 ? '' : 's'}`}
        </span>
        <button
          onClick={load}
          className="px-3 py-1.5 rounded-md text-xs font-semibold"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          Atualizar
        </button>
      </div>

      {err && (
        <div className="p-4 rounded-md mb-4 text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
          {err}
        </div>
      )}

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--ffv-bg)' }}>
            <tr style={{ color: 'var(--ffv-muted)' }}>
              <th className="text-left px-4 py-2 font-semibold">Quando</th>
              <th className="text-left px-4 py-2 font-semibold">Quem</th>
              <th className="text-left px-4 py-2 font-semibold">Tipo</th>
              <th className="text-left px-4 py-2 font-semibold">Base</th>
              <th className="text-left px-4 py-2 font-semibold">O quê</th>
            </tr>
          </thead>
          <tbody>
            {views.map(v => {
              const b = kindBadge(v.kind);
              const target = v.slug || v.path || '—';
              const link = v.kind === 'module' && v.slug
                ? (v.baseSlug && v.baseSlug !== 'tecnologia' ? `/${v.baseSlug}/${v.slug}` : `/aprenda/${v.slug}`)
                : v.path;
              return (
                <tr key={v.id} style={{ borderTop: '1px solid var(--ffv-border)' }}>
                  <td className="px-4 py-2 whitespace-nowrap" style={{ color: 'var(--ffv-muted)' }}>
                    <time title={v.viewedAt}>{formatRelative(v.viewedAt)}</time>
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {v.displayLabel}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: b.bg, color: b.color }}
                    >
                      <span>{b.emoji}</span> {v.kind}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
                    {baseBadge(v.baseSlug)}
                  </td>
                  <td className="px-4 py-2">
                    {link ? (
                      <Link href={link} className="hover:underline" style={{ color: 'var(--ffv-blue)' }}>
                        {target}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--ffv-muted)' }}>{target}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && views.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--ffv-muted)' }}>
                  Nenhum acesso encontrado no período/filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
