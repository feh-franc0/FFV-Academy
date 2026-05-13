'use client';

/**
 * CommentSection — caixa de discussão genérica.
 *
 * Recebe target={article|trail|block} + id. Funciona em /aprenda/[slug] e
 * em landings de trilha. Lê sem login; comentar exige conta.
 *
 * Threading: 1 nível só por enquanto (parent_id, sem grandchildren) — keep
 * it simple. UI de reply em rodada seguinte.
 */
import { useCallback, useEffect, useState } from 'react';
import { listComments, createComment, deleteComment, type CommentDTO } from '@/lib/comments-api';
import { useAuth } from '@/hooks/useAuth';

type TargetType = 'article' | 'trail' | 'block';

interface Props {
  targetType: TargetType;
  targetId: string;
}

export function CommentSection({ targetType, targetId }: Props) {
  const { user, isLoggedIn, requireLogin } = useAuth();
  const [items, setItems] = useState<CommentDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await listComments(targetType, targetId, 50, 0);
    if (res) {
      setItems(res.data);
      setTotal(res.total);
    }
    setLoading(false);
  }, [targetType, targetId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const content = draft.trim();
    if (content.length < 1) return;
    if (content.length > 4000) {
      setError('Comentário muito longo (máx 4000 caracteres).');
      return;
    }

    if (!isLoggedIn) {
      try {
        await requireLogin('Faça login para comentar.');
      } catch {
        return;
      }
    }

    setPosting(true);
    const created = await createComment({ targetType, targetId, content });
    setPosting(false);

    if (!created) {
      setError('Falha ao enviar comentário. Tente novamente.');
      return;
    }
    setDraft('');
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Apagar este comentário?')) return;
    const ok = await deleteComment(id);
    if (ok) refresh();
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Discussão {total > 0 && <span className="text-sm font-normal" style={{ color: 'var(--ffv-muted)' }}>({total})</span>}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={isLoggedIn ? 'Escreva um comentário...' : 'Faça login para comentar...'}
          rows={3}
          maxLength={4000}
          className="w-full p-3 rounded-md text-sm resize-y"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
            color: 'var(--foreground)',
            minHeight: 80,
          }}
        />
        {error && (
          <p className="text-sm mt-1" style={{ color: 'var(--ffv-red, #dc2626)' }}>
            {error}
          </p>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
            {draft.length}/4000
          </span>
          <button
            type="submit"
            disabled={posting || draft.trim().length === 0}
            className="px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--ffv-blue)', color: 'white' }}
          >
            {posting ? 'Enviando…' : 'Comentar'}
          </button>
        </div>
      </form>

      {loading && (
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Carregando comentários…
        </p>
      )}

      {!loading && items.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Nenhum comentário ainda. Seja o primeiro.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {items.map(c => (
          <li
            key={c.id}
            className="p-3 rounded-md"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <div className="flex items-center justify-between mb-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {c.authorName || 'Anônimo'}
              </span>
              <span>{new Date(c.createdAt).toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
              {c.content}
            </p>
            {user?.id === c.userId && (
              <button
                onClick={() => handleDelete(c.id)}
                className="mt-2 text-xs underline"
                style={{ color: 'var(--ffv-muted)' }}
              >
                apagar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
