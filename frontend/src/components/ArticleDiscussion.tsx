'use client';

import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

interface Question {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
  upvotes: number;
  answered: boolean;
}

interface ArticleDiscussionProps {
  slug: string;
  title: string;
  accentColor?: string;
}

const KEY = (slug: string) => `ffv_discussion_${slug}`;
const UPVOTES_KEY = (slug: string) => `ffv_discussion_upvotes_${slug}`;

function loadQuestions(slug: string): Question[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY(slug)) ?? '[]') as Question[];
  } catch {
    return [];
  }
}

function saveQuestions(slug: string, questions: Question[]) {
  localStorage.setItem(KEY(slug), JSON.stringify(questions));
}

function loadUpvoted(slug: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(UPVOTES_KEY(slug)) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function ArticleDiscussion({ slug, title, accentColor = 'var(--ffv-blue)' }: ArticleDiscussionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [newQuestion, setNewQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setQuestions(loadQuestions(slug));
    setUpvoted(loadUpvoted(slug));
    const name = localStorage.getItem(STORAGE_KEYS.USER_NAME) ?? '';
    setAuthorName(name);
  }, [slug]);

  function handleSubmit() {
    if (!newQuestion.trim()) return;
    const q: Question = {
      id: Date.now().toString(36),
      text: newQuestion.trim(),
      authorName: authorName.trim() || 'Anônimo',
      createdAt: new Date().toISOString(),
      upvotes: 0,
      answered: false,
    };
    const updated = [q, ...questions];
    setQuestions(updated);
    saveQuestions(slug, updated);
    setNewQuestion('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  function handleUpvote(id: string) {
    if (upvoted.has(id)) return;
    const updated = questions.map(q => q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q);
    const newUpvoted = new Set([...upvoted, id]);
    setQuestions(updated);
    setUpvoted(newUpvoted);
    saveQuestions(slug, updated);
    localStorage.setItem(UPVOTES_KEY(slug), JSON.stringify([...newUpvoted]));
  }

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Tenho uma dúvida sobre "${title}" na @feh_franc0 FFV Academy:\n\n${newQuestion}\n\nhttps://fernandofrancovalle.com/aprenda/${slug}`)}`;

  const sortedQuestions = [...questions].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <section className="mt-14 ffv-no-print" style={{ borderTop: '1px solid var(--ffv-border)', paddingTop: 48 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono uppercase tracking-widest text-xs mb-1" style={{ color: accentColor, letterSpacing: '0.12em' }}>
            Discussão
          </p>
          <h2 className="text-base font-bold">
            Dúvidas sobre este artigo
            {questions.length > 0 && <span className="ml-2 text-sm font-normal" style={{ color: 'var(--ffv-muted)' }}>({questions.length})</span>}
          </h2>
        </div>
        {questions.length > 2 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ color: 'var(--ffv-muted)' }}
          >
            {expanded ? 'Ver menos' : `Ver todas (${questions.length})`}
          </button>
        )}
      </div>

      {/* Submit question */}
      <div className="p-5 rounded-2xl mb-6" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ffv-muted)' }}>Ficou com alguma dúvida?</p>
        {!submitted ? (
          <>
            <textarea
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              placeholder="Escreva sua dúvida técnica aqui..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all mb-3"
              style={{ background: 'var(--ffv-bg3)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)', lineHeight: 1.6 }}
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="Seu nome (opcional)"
                className="flex-1 min-w-0 px-4 py-2 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'var(--ffv-bg3)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)', maxWidth: 220 }}
              />
              <div className="flex items-center gap-2">
                {newQuestion.trim().length > 10 && (
                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                    style={{ color: '#1da1f2', background: 'color-mix(in srgb, #1da1f2 12%, transparent)', border: '1px solid color-mix(in srgb, #1da1f2 30%, transparent)', textDecoration: 'none' }}
                    title="Perguntar no X/Twitter para resposta pública"
                  >
                    𝕏 Perguntar no Twitter
                  </a>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!newQuestion.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: accentColor, color: '#0d1117' }}
                >
                  Enviar →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm font-semibold">Dúvida registrada!</p>
            <p className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>
              Para resposta mais rápida, compartilhe no X e marque @feh_franc0
            </p>
          </div>
        )}
      </div>

      {/* Questions list */}
      {sortedQuestions.length > 0 && (
        <div className="flex flex-col gap-3">
          {(expanded ? sortedQuestions : sortedQuestions.slice(0, 3)).map(q => (
            <div
              key={q.id}
              className="p-4 rounded-xl"
              style={{
                background: 'var(--ffv-bg2)',
                border: `1px solid ${q.answered ? 'color-mix(in srgb, var(--ffv-green) 25%, transparent)' : 'var(--ffv-border)'}`,
              }}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleUpvote(q.id)}
                  className="flex flex-col items-center gap-0.5 pt-0.5 transition-all hover:opacity-80"
                  style={{ color: upvoted.has(q.id) ? accentColor : 'var(--ffv-muted)', minWidth: 28 }}
                  title={upvoted.has(q.id) ? 'Já votou' : 'Votar nesta dúvida'}
                >
                  <span style={{ fontSize: 14 }}>▲</span>
                  <span className="text-xs font-bold tabular-nums">{q.upvotes}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">{q.text}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px]" style={{ color: 'var(--ffv-muted)' }}>
                    <span>{q.authorName}</span>
                    <span>·</span>
                    <span>{new Date(q.createdAt).toLocaleDateString('pt-BR')}</span>
                    {q.answered && <span className="px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'color-mix(in srgb, var(--ffv-green) 15%, transparent)', color: 'var(--ffv-green)' }}>✓ Respondida</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {questions.length === 0 && (
        <p className="text-sm text-center py-6" style={{ color: 'var(--ffv-muted)' }}>
          Seja o primeiro a fazer uma pergunta sobre este artigo.
        </p>
      )}

      <p className="mt-6 text-xs text-center" style={{ color: 'var(--ffv-muted)' }}>
        Para discussões mais ricas, entre no{' '}
        <a href="/comunidade" style={{ color: accentColor, textDecoration: 'none' }}>canal da comunidade</a>.
      </p>
    </section>
  );
}
