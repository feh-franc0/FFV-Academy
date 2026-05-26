'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  adminListComments,
  adminHideComment,
  adminRestoreComment,
  CommentApiError,
  type Comment,
  type CommentStatus,
} from '@/lib/comment-api';
import { toast } from '@/lib/toast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { BigNumberCard } from '@/components/admin/BigNumberCard';

/**
 * Admin → moderação de comentários.
 *
 * Filtros: status (flagged padrão, hidden, visible, deleted).
 * Ações por comment: Restore (volta pra visible), Hide (esconde do público).
 * Trigger postgres já auto-flag em ≥3 reports — esta página é o pulmão de
 * revisão manual depois do auto-flag.
 *
 * Acesso: cliente fetcha /api/v1/admin/comments, que exige role=admin no
 * backend. UI não bloqueia (lib retorna 403 que mostramos na tela), mas
 * a tela só está linkada do admin dashboard.
 */
export function AdminCommentsClient() {
  const [status, setStatus] = useState<CommentStatus>('flagged');
  const [items, setItems] = useState<Comment[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Snapshot por status — pra big numbers ("Reportados: N, Escondidos: M")
  // sem precisar de endpoint dedicado. Atualiza após cada ação (hide/restore).
  const [statusCounts, setStatusCounts] = useState<Record<CommentStatus, number>>({
    flagged: 0,
    hidden: 0,
    visible: 0,
    deleted: 0,
  });

  const fetchItems = useCallback(async (signal?: AbortSignal) => {
    setLoadError(null);
    setItems(null);
    try {
      const res = await adminListComments(status, { signal, limit: pageSize, offset: page * pageSize });
      setItems(res.data);
      setTotal(res.total);
      setStatusCounts(prev => ({ ...prev, [status]: res.total }));
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
      if (err instanceof CommentApiError && err.isForbidden) {
        setLoadError('Você precisa de role=admin pra ver essa página.');
      } else {
        setLoadError(err instanceof CommentApiError ? err.message : 'Erro ao carregar.');
      }
      setItems([]);
    }
  }, [status, page, pageSize]);

  useEffect(() => {
    const ctrl = new AbortController();
    void fetchItems(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchItems]);

  // Pre-fetch dos counts dos outros status pra alimentar big numbers.
  // Chama 1x ao montar e após cada hide/restore.
  const refreshAllCounts = useCallback(async () => {
    const all: CommentStatus[] = ['flagged', 'hidden', 'visible', 'deleted'];
    const results = await Promise.allSettled(
      all.map(s => adminListComments(s, { limit: 1, offset: 0 })),
    );
    const counts: Record<CommentStatus, number> = { flagged: 0, hidden: 0, visible: 0, deleted: 0 };
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') counts[all[i]] = r.value.total;
    });
    setStatusCounts(counts);
  }, []);

  useEffect(() => {
    void refreshAllCounts();
  }, [refreshAllCounts]);

  async function handleHide(c: Comment) {
    if (!confirm(`Esconder esse comentário de "${c.authorName}"?`)) return;
    try {
      await adminHideComment(c.id);
      setItems(prev => (prev ?? []).filter(x => x.id !== c.id));
      setTotal(t => Math.max(0, t - 1));
      toast.success('Comentário escondido.');
      void refreshAllCounts();
    } catch (err) {
      toast.error(err instanceof CommentApiError ? err.message : 'Erro ao esconder.');
    }
  }

  async function handleRestore(c: Comment) {
    if (!confirm(`Restaurar esse comentário de "${c.authorName}"?`)) return;
    try {
      await adminRestoreComment(c.id);
      setItems(prev => (prev ?? []).filter(x => x.id !== c.id));
      setTotal(t => Math.max(0, t - 1));
      toast.success('Comentário restaurado.');
      void refreshAllCounts();
    } catch (err) {
      toast.error(err instanceof CommentApiError ? err.message : 'Erro ao restaurar.');
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">Moderação de comentários</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)' }}>
        Comentários auto-flagueados (≥3 reports) caem aqui. Revise e decida.
      </p>

      {/* Big numbers */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <BigNumberCard label="Reportados" value={statusCounts.flagged} hint="aguardando revisão" />
        <BigNumberCard label="Escondidos" value={statusCounts.hidden} hint="moderados pela admin" />
        <BigNumberCard label="Visíveis" value={statusCounts.visible} hint="liberados ao público" />
        <BigNumberCard label="Deletados" value={statusCounts.deleted} hint="pelo próprio autor" />
      </section>

      {/* Filtro de status */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(['flagged', 'hidden', 'visible', 'deleted'] as CommentStatus[]).map(s => {
          const active = status === s;
          const label = ({ flagged: 'Reportados', hidden: 'Escondidos', visible: 'Visíveis', deleted: 'Deletados' } as const)[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => { setPage(0); setStatus(s); }}
              aria-pressed={active}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: active ? 'var(--ffv-ink)' : 'var(--ffv-bg2)',
                color: active ? 'var(--ffv-paper)' : 'var(--ffv-muted)',
                border: `1px solid ${active ? 'var(--ffv-ink)' : 'var(--ffv-border)'}`,
              }}
            >
              {label}
            </button>
          );
        })}
        <span className="text-xs ml-2" style={{ color: 'var(--ffv-muted)' }}>
          {items === null ? 'carregando…' : `${total} ${total === 1 ? 'comentário' : 'comentários'}`}
        </span>
      </div>

      {loadError && (
        <div
          role="alert"
          className="rounded-lg p-3 text-sm mb-6"
          style={{
            background: 'color-mix(in srgb, var(--ffv-red, #f78166) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ffv-red, #f78166) 38%, transparent)',
            color: 'var(--ffv-red, #f78166)',
          }}
        >
          {loadError}
        </div>
      )}

      {items !== null && items.length === 0 && !loadError && (
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Nenhum comentário neste status. Tudo limpo.
        </p>
      )}

      {items !== null && items.length > 0 && (
        <>
        <ul className="flex flex-col gap-4 list-none p-0">
          {items.map(c => (
            <li
              key={c.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
            >
              <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>
                    {c.authorName || 'Anônimo'}{' '}
                    <span style={{ color: 'var(--ffv-muted)', fontWeight: 400, fontSize: 12 }}>
                      · {c.targetType}/{c.targetId} · score {c.score}
                    </span>
                  </p>
                  <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                    {new Date(c.createdAt).toLocaleString('pt-BR')} · id <code>{c.id.slice(0, 8)}</code>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {c.status !== 'visible' && (
                    <button
                      type="button"
                      onClick={() => void handleRestore(c)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{
                        background: 'color-mix(in srgb, var(--ffv-green) 14%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--ffv-green) 38%, transparent)',
                        color: 'var(--ffv-green)',
                        cursor: 'pointer',
                      }}
                    >
                      Restaurar
                    </button>
                  )}
                  {c.status !== 'hidden' && (
                    <button
                      type="button"
                      onClick={() => void handleHide(c)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{
                        background: 'color-mix(in srgb, var(--ffv-red, #f78166) 14%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--ffv-red, #f78166) 38%, transparent)',
                        color: 'var(--ffv-red, #f78166)',
                        cursor: 'pointer',
                      }}
                    >
                      Esconder
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--foreground)' }}>
                {c.content}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <AdminPagination
            total={total}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            onPageSize={ps => { setPage(0); setPageSize(ps); }}
          />
        </div>
        </>
      )}
    </main>
  );
}
