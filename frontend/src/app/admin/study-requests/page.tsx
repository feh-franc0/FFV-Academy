/**
 * /admin/study-requests — Lista de solicitações de experiência personalizada.
 *
 * Consome GET /api/v1/admin/study-requests com filtros (status, área, busca).
 * Visão de "inbox" — pendentes primeiro, com badges coloridos por status
 * e CTA para abrir o detalhe.
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminPagination } from '@/components/admin/AdminPagination';
import {
  fetchStudyRequests,
  STUDY_REQUEST_STATUS_COLOR,
  STUDY_REQUEST_STATUS_LABEL,
  STUDY_REQUEST_STATUSES,
  type StudyRequestStatus,
  type StudyRequestsListResponse,
} from '@/lib/admin-api';

export default function AdminStudyRequestsPage() {
  const [data, setData] = useState<StudyRequestsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StudyRequestStatus | ''>('');
  const [studyArea, setStudyArea] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchStudyRequests({
      status,
      studyArea: studyArea || undefined,
      search: search || undefined,
      limit: pageSize,
      offset: page * pageSize,
    })
      .then(res => {
        if (!cancelled) setData(res);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, studyArea, search, page, pageSize]);

  return (
    <div className="flex flex-col gap-4 max-w-7xl">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Solicitações de estudo</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {data
              ? `${data.total.toLocaleString('pt-BR')} solicitação(ões) no total`
              : 'Carregando…'}
          </p>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="text"
          placeholder="Buscar nome, email, matéria…"
          value={search}
          onChange={e => {
            setPage(0);
            setSearch(e.target.value);
          }}
          className="flex-1 min-w-[220px] max-w-md px-3 py-2 rounded-md text-sm"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
            color: 'var(--foreground)',
          }}
        />
        <select
          value={status}
          onChange={e => {
            setPage(0);
            setStatus(e.target.value as StudyRequestStatus | '');
          }}
          className="px-3 py-2 rounded-md text-sm"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">Todos os status</option>
          {STUDY_REQUEST_STATUSES.map(s => (
            <option key={s} value={s}>
              {STUDY_REQUEST_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Área (slug)…"
          value={studyArea}
          onChange={e => {
            setPage(0);
            setStudyArea(e.target.value);
          }}
          className="w-44 px-3 py-2 rounded-md text-sm"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
            color: 'var(--foreground)',
          }}
        />
      </div>

      {/* Tabela */}
      <div
        className="rounded-xl overflow-x-auto"
        style={{ border: '1px solid var(--ffv-border)' }}
      >
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--ffv-bg2)' }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-left font-semibold">Nome</th>
              <th className="px-3 py-2 text-left font-semibold">Email</th>
              <th className="px-3 py-2 text-left font-semibold">Área</th>
              <th className="px-3 py-2 text-left font-semibold">Matéria</th>
              <th className="px-3 py-2 text-left font-semibold">Conta</th>
              <th className="px-3 py-2 text-left font-semibold">Criado em</th>
              <th className="px-3 py-2 text-left font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center"
                  style={{ color: 'var(--ffv-muted)' }}
                >
                  Carregando…
                </td>
              </tr>
            )}
            {!loading && data?.data.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center"
                  style={{ color: 'var(--ffv-muted)' }}
                >
                  Nenhuma solicitação encontrada com esses filtros.
                </td>
              </tr>
            )}
            {!loading &&
              data?.data.map((req, i) => (
                <tr
                  key={req.id}
                  style={{
                    background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)',
                  }}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <StatusPill status={req.status} />
                  </td>
                  <td className="px-3 py-2 font-medium">{req.name}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--ffv-muted)' }}>
                    {req.email}
                  </td>
                  <td className="px-3 py-2">{req.studyArea}</td>
                  <td className="px-3 py-2 max-w-xs truncate" title={req.subject}>
                    {req.subject}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <EmailVerificationBadge
                      emailVerifiedAt={req.emailVerifiedAt}
                      lastLoginAt={req.lastLoginAt}
                      userId={req.userId}
                    />
                  </td>
                  <td
                    className="px-3 py-2 whitespace-nowrap"
                    style={{ color: 'var(--ffv-muted)' }}
                  >
                    {formatRelative(req.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/study-requests/${req.id}`}
                      className="px-3 py-1 rounded-md text-xs font-semibold"
                      style={{
                        background: 'var(--ffv-blue)',
                        color: '#fff',
                      }}
                    >
                      Abrir →
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && (
        <AdminPagination
          total={data.total}
          page={page}
          pageSize={pageSize}
          onPage={setPage}
          onPageSize={setPageSize}
        />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: StudyRequestStatus }) {
  const color = STUDY_REQUEST_STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
      style={{
        background: `color-mix(in srgb, ${color} 18%, transparent)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
      }}
    >
      {STUDY_REQUEST_STATUS_LABEL[status]}
    </span>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} d`;
  return date.toLocaleDateString('pt-BR');
}

/**
 * Badge visual de verificação do email do estudante. 3 estados:
 *
 *   🟢 Email verificado · "logou há 2h"  — estudante clicou no magic-link e
 *      entrou. Lead real, prioriza na fila.
 *   🟡 Aguardando confirmação            — solicitação criada conta passwordless
 *      mas estudante ainda não clicou no email. Pode ser real (vai chegar) ou
 *      bounce — esperar 24-48h.
 *   ⚪ Lead anônimo                       — solicitação antiga (pré-2026-05) sem
 *      conta vinculada. Só email solto, sem prova.
 */
function EmailVerificationBadge({
  emailVerifiedAt,
  lastLoginAt,
  userId,
}: {
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  userId?: string;
}) {
  if (emailVerifiedAt) {
    const loginInfo = lastLoginAt
      ? `logou ${formatRelative(lastLoginAt)}`
      : `verificado ${formatRelative(emailVerifiedAt)}`;
    return (
      <span
        title={`Email verificado em ${new Date(emailVerifiedAt).toLocaleString('pt-BR')} · ${loginInfo}`}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
        style={{
          background: 'color-mix(in srgb, #3fb950 16%, transparent)',
          color: '#2ea043',
          border: '1px solid color-mix(in srgb, #3fb950 36%, transparent)',
        }}
      >
        📩 {loginInfo}
      </span>
    );
  }
  if (userId) {
    return (
      <span
        title="Conta passwordless criada — estudante ainda não confirmou o email (não clicou no magic-link)"
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
        style={{
          background: 'color-mix(in srgb, #d29922 16%, transparent)',
          color: '#bb8009',
          border: '1px solid color-mix(in srgb, #d29922 36%, transparent)',
        }}
      >
        🟡 aguardando
      </span>
    );
  }
  return (
    <span
      title="Lead anônimo — sem conta vinculada (solicitação antiga)"
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{
        color: 'var(--ffv-muted)',
        border: '1px solid var(--ffv-border)',
      }}
    >
      ⚪ anônimo
    </span>
  );
}
