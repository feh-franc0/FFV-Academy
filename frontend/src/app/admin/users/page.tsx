/**
 * /admin/users — lista paginada de usuários.
 *
 * Consome GET /api/v1/admin/users com filtros (search, role). Paginado em
 * lotes de 50. Mostra email, nome, role, criado-em, status.
 */
'use client';

import { useEffect, useState } from 'react';
import { fetchAdminUsers, type AdminUsersResponse } from '@/lib/admin-api';

const PAGE_SIZE = 50;

export default function AdminUsersPage() {
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminUsers({ search, role, limit: PAGE_SIZE, offset: page * PAGE_SIZE })
      .then(res => {
        if (!cancelled) setData(res);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search, role, page]);

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          {data ? `${data.total.toLocaleString('pt-BR')} usuários no total` : '…'}
        </p>
      </header>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Buscar email ou nome..."
          value={search}
          onChange={e => {
            setPage(0);
            setSearch(e.target.value);
          }}
          className="flex-1 max-w-md px-3 py-2 rounded-md text-sm"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
        />
        <select
          value={role}
          onChange={e => {
            setPage(0);
            setRole(e.target.value);
          }}
          className="px-3 py-2 rounded-md text-sm"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
        >
          <option value="">Todos os roles</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </div>

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--ffv-border)' }}>
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--ffv-bg2)' }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Email</th>
              <th className="px-3 py-2 text-left font-semibold">Nome</th>
              <th className="px-3 py-2 text-left font-semibold">Role</th>
              <th className="px-3 py-2 text-left font-semibold">Marketing</th>
              <th className="px-3 py-2 text-left font-semibold">Criado em</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
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
            {!loading && data?.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center" style={{ color: 'var(--ffv-muted)' }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {!loading &&
              data?.data.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid var(--ffv-border)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)',
                  }}
                >
                  <td className="px-3 py-2 font-mono">{u.email}</td>
                  <td className="px-3 py-2">{u.name || '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        background: u.role === 'admin' ? 'var(--ffv-blue)' : 'var(--ffv-bg2)',
                        color: u.role === 'admin' ? 'white' : 'var(--ffv-muted)',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-2">{u.marketingConsent ? '✓' : '—'}</td>
                  <td className="px-3 py-2">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-3 py-2">{u.deletedAt ? 'deletado' : 'ativo'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded-md disabled:opacity-40"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            ← Anterior
          </button>
          <span style={{ color: 'var(--ffv-muted)' }}>
            Página {page + 1} de {Math.ceil(data.total / PAGE_SIZE)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * PAGE_SIZE >= data.total}
            className="px-3 py-1 rounded-md disabled:opacity-40"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
