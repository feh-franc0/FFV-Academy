/**
 * /admin/audit — log de mutações HTTP (audit_logs).
 *
 * Mostra: ação, status, latência, usuário, IP, data. Filtros simples.
 */
'use client';

import { useEffect, useState } from 'react';
import { fetchAuditLog, type AuditEntry } from '@/lib/admin-api';
import { AdminPagination } from '@/components/admin/AdminPagination';

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAuditLog({ limit: pageSize, offset: page * pageSize, action })
      .then(res => {
        if (cancelled) return;
        setEntries(res?.data ?? []);
        setTotal(res?.total ?? 0);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [action, page, pageSize]);

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          {total > 0 ? `${total.toLocaleString('pt-BR')} eventos no total` : `${entries.length} eventos mostrados`}
        </p>
      </header>

      <input
        type="text"
        placeholder="Filtrar por ação (ex: POST /api/v1/auth)…"
        value={action}
        onChange={e => { setPage(0); setAction(e.target.value); }}
        className="max-w-md px-3 py-2 rounded-md text-sm"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
      />

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--ffv-border)' }}>
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--ffv-bg2)' }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Quando</th>
              <th className="px-3 py-2 text-left font-semibold">Ação</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-left font-semibold">Latência</th>
              <th className="px-3 py-2 text-left font-semibold">Actor</th>
              <th className="px-3 py-2 text-left font-semibold">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center" style={{ color: 'var(--ffv-muted)' }}>
                  Carregando…
                </td>
              </tr>
            )}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center" style={{ color: 'var(--ffv-muted)' }}>
                  Nenhum evento registrado.
                </td>
              </tr>
            )}
            {!loading &&
              entries.map((e, i) => (
                <tr
                  key={e.id}
                  style={{
                    borderBottom: '1px solid var(--ffv-border)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)',
                  }}
                >
                  <td className="px-3 py-2 font-mono whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-3 py-2 font-mono">{e.action}</td>
                  <td className="px-3 py-2">
                    <span
                      style={{
                        color: (e.status ?? 0) >= 400 ? 'var(--ffv-red, #dc2626)' : 'var(--ffv-green, #16a34a)',
                      }}
                    >
                      {e.status ?? '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2">{e.latency_ms ?? '—'}ms</td>
                  <td className="px-3 py-2 font-mono">{e.actor ?? e.user_id ?? '—'}</td>
                  <td className="px-3 py-2 font-mono">{e.ip ?? '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        total={total}
        page={page}
        pageSize={pageSize}
        onPage={p => { setPage(p); }}
        onPageSize={ps => { setPage(0); setPageSize(ps); }}
      />
    </div>
  );
}
