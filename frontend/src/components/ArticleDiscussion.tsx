'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listComments,
  createComment,
  voteComment,
  reportComment,
  deleteComment,
  validateCommentLocally,
  CommentApiError,
  COMMENT_MAX_CHARS,
  type Comment,
  type CommentTargetType,
} from '@/lib/comment-api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';

interface Props {
  slug: string;
  title: string;
  accentColor?: string;
  /** Tipo do alvo. Default 'article' — pra trilha passa 'trail'. */
  targetType?: CommentTargetType;
}

/**
 * ArticleDiscussion — comentários cross-user persistidos no backend.
 *
 * Substitui versão legada localStorage-only. Backend Go cuida de:
 *  - Auth required (POST/DELETE/Vote/Report — 401 se sem JWT)
 *  - Char limit 1000 (CHECK constraint + handler validation)
 *  - Anti-spam (URLs, all caps, char repeat, banned words) — backend rejeita 400
 *  - Rate limit Redis (10/min create, 60/min vote, 20/min report)
 *  - Auto-flag em ≥3 reports
 *
 * Cliente faz validação espelho (instantânea) + UI states de erro/rate-limit.
 */
export function ArticleDiscussion({
  slug,
  title: _title,
  accentColor = 'var(--ffv-blue)',
  targetType = 'article',
}: Props) {
  const { user, requireLogin } = useAuth();
  const [comments, setComments] = useState<Comment[] | null>(null); // null = loading, [] = empty
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  // Threading: parentId quando o usuário está respondendo um comment.
  const [replyParentId, setReplyParentId] = useState<string | null>(null);

  const fetchComments = useCallback(async (signal?: AbortSignal) => {
    setLoadError(null);
    try {
      const res = await listComments(targetType, slug, { signal, limit: 100 });
      setComments(res.data);
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
      setLoadError(err instanceof CommentApiError ? err.message : 'Erro ao carregar comentários');
      // NOT seta comments=[] — manter null evita renderizar "sem comentários"
      // junto com a mensagem de erro (contradição que confundia o usuário).
    }
  }, [slug, targetType]);

  useEffect(() => {
    const ctrl = new AbortController();
    void fetchComments(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchComments]);

  const draftValidation = useMemo(() => validateCommentLocally(draft), [draft]);
  const remaining = COMMENT_MAX_CHARS - draft.trim().length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!draftValidation.ok) {
      setSubmitError(draftValidation.reason);
      return;
    }

    if (!user) {
      try {
        await requireLogin('comentar');
      } catch {
        return; // usuário cancelou
      }
    }

    setSubmitting(true);
    try {
      const created = await createComment({
        targetType,
        targetId: slug,
        content: draft.trim(),
        parentId: replyParentId ?? undefined,
      });
      setComments(prev => [...(prev ?? []), created]);
      setDraft('');
      setReplyParentId(null);
      toast.success(replyParentId ? 'Resposta publicada.' : 'Comentário publicado.');
    } catch (err) {
      if (err instanceof CommentApiError) {
        if (err.isRateLimited) {
          setSubmitError('Você está comentando muito rápido. Aguarde 1 minuto.');
        } else if (err.isAuthRequired) {
          setSubmitError('Sessão expirou. Faça login novamente.');
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(c: Comment, vote: -1 | 1) {
    // Garante login ANTES do optimistic update. Antes: pisca o vote acionado
    // enquanto modal de login abre, e se o user cancela, faz rollback feio.
    // Agora: modal abre primeiro; só se autenticar, aplica optimistic.
    if (!user) {
      try { await requireLogin('votar'); } catch { return; /* cancelado */ }
    }
    // Toggle: se já votou no mesmo, desfaz (vote=0). Senão, troca pro novo.
    const targetVote: -1 | 0 | 1 = c.userVote === vote ? 0 : vote;
    const snapshot = c; // captura pro rollback
    // Optimistic update
    setComments(prev =>
      (prev ?? []).map(x => {
        if (x.id !== c.id) return x;
        const delta = targetVote - (x.userVote ?? 0);
        return { ...x, userVote: targetVote, score: x.score + delta };
      }),
    );
    try {
      await voteComment(c.id, targetVote);
    } catch (err) {
      // Rollback optimistic + mensagem.
      setComments(prev =>
        (prev ?? []).map(x => (x.id === c.id ? snapshot : x)),
      );
      if (err instanceof CommentApiError && err.isRateLimited) {
        toast.error('Muitos votos seguidos. Aguarde um minuto.');
      } else {
        toast.error('Não foi possível registrar o voto.');
      }
    }
  }

  async function handleReport(c: Comment) {
    if (!confirm('Reportar esse comentário? Admin será notificado.')) return;
    try {
      if (!user) await requireLogin('reportar');
      await reportComment(c.id, 'reportado pelo usuário');
      toast.success('Reporte registrado. Obrigado.');
    } catch (err) {
      if (err instanceof CommentApiError && err.isRateLimited) {
        toast.error('Muitos reportes. Aguarde um minuto.');
      } else if (!(err instanceof Error && err.message === 'login cancelado')) {
        toast.error('Não foi possível reportar.');
      }
    }
  }

  async function handleDelete(c: Comment) {
    if (!confirm('Apagar seu comentário? Não dá pra desfazer.')) return;
    try {
      await deleteComment(c.id);
      setComments(prev => (prev ?? []).filter(x => x.id !== c.id));
      toast.success('Comentário apagado.');
    } catch (err) {
      toast.error(err instanceof CommentApiError ? err.message : 'Erro ao apagar.');
    }
  }

  const headerCount = comments?.length ?? 0;

  return (
    <section
      className="max-w-3xl mx-auto px-6 pt-12 pb-8"
      style={{ borderTop: '1px solid var(--ffv-border)' }}
      aria-labelledby="discussion-heading"
    >
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 id="discussion-heading" className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
          Discussão {headerCount > 0 && (
            <span style={{ color: 'var(--ffv-muted)', fontWeight: 500, fontSize: '0.85em' }}>
              · {headerCount}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="text-xs font-semibold transition-opacity hover:opacity-80"
          style={{ color: accentColor, background: 'none', border: 'none', cursor: 'pointer' }}
          aria-expanded={expanded}
        >
          {expanded ? 'Recolher ↑' : 'Comentar ou perguntar →'}
        </button>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="mb-6" aria-label="Novo comentário">
          <label htmlFor="comment-draft" className="block text-xs font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>
            {replyParentId ? (
              <span>
                Respondendo a um comentário
                {' '}
                <button
                  type="button"
                  onClick={() => setReplyParentId(null)}
                  style={{ color: accentColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                >
                  · cancelar
                </button>
              </span>
            ) : (
              <>Seu comentário {user ? `· ${user.name}` : '· (faça login pra publicar)'}</>
            )}
          </label>
          <textarea
            id="comment-draft"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Compartilhe uma dúvida, complemente o conteúdo, troque ideia com outros estudantes…"
            maxLength={COMMENT_MAX_CHARS + 100}
            rows={3}
            className="w-full p-3 rounded-lg text-sm"
            style={{
              background: 'var(--ffv-bg2)',
              border: `1px solid ${submitError ? 'var(--ffv-red, #f78166)' : 'var(--ffv-border)'}`,
              color: 'var(--foreground)',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: 80,
            }}
            aria-invalid={submitError ? 'true' : undefined}
            aria-describedby="comment-helper"
          />
          <div
            id="comment-helper"
            className="flex items-center justify-between mt-2 flex-wrap gap-2"
            style={{ fontSize: 11 }}
          >
            <span style={{ color: submitError ? 'var(--ffv-red, #f78166)' : 'var(--ffv-muted)' }}>
              {submitError ?? 'Markdown não suportado · 1 link por comentário · sem CAIXA ALTA'}
            </span>
            <span
              style={{
                color: remaining < 50 ? 'var(--ffv-red, #f78166)' : 'var(--ffv-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
              aria-live="polite"
            >
              {remaining} / {COMMENT_MAX_CHARS} chars
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              type="submit"
              disabled={submitting || !draftValidation.ok}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: accentColor, color: '#0d1117', border: 'none', cursor: submitting ? 'wait' : 'pointer' }}
            >
              {submitting ? 'Publicando…' : 'Publicar comentário'}
            </button>
            <button
              type="button"
              onClick={() => { setDraft(''); setSubmitError(null); }}
              className="px-3 py-2 rounded-lg text-xs"
              style={{ background: 'transparent', border: '1px solid var(--ffv-border)', color: 'var(--ffv-muted)', cursor: 'pointer' }}
            >
              Limpar
            </button>
          </div>
        </form>
      )}

      {loadError && (
        <p className="text-sm" style={{ color: 'var(--ffv-red, #f78166)' }}>
          {loadError}
          <button
            type="button"
            onClick={() => void fetchComments()}
            className="ml-2 underline"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            tentar de novo
          </button>
        </p>
      )}

      {comments === null && !loadError && (
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>Carregando…</p>
      )}

      {comments !== null && comments.length === 0 && !loadError && (
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Ainda sem comentários. Seja a primeira pessoa a compartilhar.
        </p>
      )}

      {comments !== null && comments.length > 0 && (
        <ul className="flex flex-col gap-4 list-none p-0">
          {buildThreads(comments).map(thread => (
            <CommentThread
              key={thread.root.id}
              root={thread.root}
              replies={thread.replies}
              currentUserId={user?.id}
              accentColor={accentColor}
              activeReplyTarget={replyParentId}
              onVote={handleVote}
              onReport={handleReport}
              onDelete={handleDelete}
              onReply={(parentId) => {
                setReplyParentId(parentId);
                setExpanded(true);
                setTimeout(() => {
                  document.getElementById('comment-draft')?.focus();
                }, 50);
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Agrupa comentários em threads (root + replies). Profundidade limitada a 1
 * nível (replies de replies aparecem flat na mesma thread root) — UX mais
 * clara que threads infinitas.
 */
interface Thread { root: Comment; replies: Comment[] }
function buildThreads(comments: Comment[]): Thread[] {
  const rootMap = new Map<string, Thread>();
  const orphanReplies: Comment[] = [];
  // Primeiro pass: separa roots dos replies
  for (const c of comments) {
    if (!c.parentId) rootMap.set(c.id, { root: c, replies: [] });
  }
  for (const c of comments) {
    if (c.parentId) {
      const t = rootMap.get(c.parentId);
      if (t) t.replies.push(c);
      else orphanReplies.push(c); // parent deletado/escondido — vira root
    }
  }
  // Replies ordenadas por created_at ascending (linha do tempo)
  for (const t of rootMap.values()) {
    t.replies.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  // Roots ordenados por score DESC (já vem assim do backend) — mas se um reply
  // virou orphan, tratamos como root no fim.
  const threads = Array.from(rootMap.values());
  for (const o of orphanReplies) threads.push({ root: o, replies: [] });
  return threads;
}

function CommentThread({
  root,
  replies,
  currentUserId,
  accentColor,
  activeReplyTarget,
  onVote,
  onReport,
  onDelete,
  onReply,
}: {
  root: Comment;
  replies: Comment[];
  currentUserId?: string;
  accentColor: string;
  activeReplyTarget: string | null;
  onVote: (c: Comment, v: 1 | -1) => void;
  onReport: (c: Comment) => void;
  onDelete: (c: Comment) => void;
  onReply: (parentId: string) => void;
}) {
  return (
    <li className="list-none">
      <CommentRow
        c={root}
        isOwn={currentUserId === root.userId}
        accentColor={accentColor}
        showReply
        replyActive={activeReplyTarget === root.id}
        onVote={onVote}
        onReport={onReport}
        onDelete={onDelete}
        onReply={() => onReply(root.id)}
      />
      {replies.length > 0 && (
        <ul
          className="list-none p-0 mt-2"
          style={{
            marginLeft: 28,
            paddingLeft: 16,
            borderLeft: '2px solid var(--ffv-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {replies.map(r => (
            <li key={r.id} className="list-none">
              <CommentRow
                c={r}
                isOwn={currentUserId === r.userId}
                accentColor={accentColor}
                showReply={false}
                onVote={onVote}
                onReport={onReport}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function CommentRow({
  c,
  isOwn,
  accentColor,
  showReply = false,
  replyActive = false,
  onVote,
  onReport,
  onDelete,
  onReply,
}: {
  c: Comment;
  isOwn: boolean;
  accentColor: string;
  showReply?: boolean;
  replyActive?: boolean;
  onVote: (c: Comment, v: 1 | -1) => void;
  onReport: (c: Comment) => void;
  onDelete: (c: Comment) => void;
  onReply?: () => void;
}) {
  const upActive = c.userVote === 1;
  const downActive = c.userVote === -1;
  return (
    <li
      className="rounded-xl p-4"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      <div className="flex items-start gap-3">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onVote(c, 1)}
            aria-label="Upvote"
            aria-pressed={upActive}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1px solid ${upActive ? accentColor : 'var(--ffv-border)'}`,
              background: upActive ? `color-mix(in srgb, ${accentColor} 14%, transparent)` : 'transparent',
              color: upActive ? accentColor : 'var(--ffv-muted)',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ▲
          </button>
          <span
            className="font-mono tabular-nums"
            style={{ fontSize: 12, fontWeight: 700, color: c.score > 0 ? accentColor : 'var(--ffv-muted)' }}
          >
            {c.score}
          </span>
          <button
            type="button"
            onClick={() => onVote(c, -1)}
            aria-label="Downvote"
            aria-pressed={downActive}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1px solid ${downActive ? 'var(--ffv-red, #f78166)' : 'var(--ffv-border)'}`,
              background: downActive ? 'color-mix(in srgb, var(--ffv-red, #f78166) 14%, transparent)' : 'transparent',
              color: downActive ? 'var(--ffv-red, #f78166)' : 'var(--ffv-muted)',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ▼
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap" style={{ fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>
              {c.authorName || 'Anônimo'}
            </span>
            <span style={{ color: 'var(--ffv-muted)' }}>
              · {formatRelative(c.createdAt)}
            </span>
            {c.edited && (
              <span style={{ color: 'var(--ffv-muted)', fontStyle: 'italic' }}>(editado)</span>
            )}
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--foreground)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {c.content}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap" style={{ fontSize: 11 }}>
            {showReply && onReply && (
              <button
                type="button"
                onClick={onReply}
                aria-pressed={replyActive}
                style={{
                  color: replyActive ? accentColor : 'var(--ffv-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 600,
                }}
              >
                {replyActive ? 'Respondendo…' : 'Responder'}
              </button>
            )}
            {isOwn ? (
              <button
                type="button"
                onClick={() => onDelete(c)}
                style={{ color: 'var(--ffv-red, #f78166)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
              >
                Apagar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReport(c)}
                style={{ color: 'var(--ffv-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
              >
                Reportar
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
