'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';

interface Props {
  slug: string;
}

/**
 * Tags positivas (após 👍) — sinal estruturado pra curadoria. Storage: chave
 * local `ffv_rating_tags:<slug>` (Set<string>). Persistência simples sem
 * mexer no GameState schema.
 */
const POSITIVE_TAGS = [
  'Exemplos top',
  'Profundidade boa',
  'Quiz desafiador',
  'Conceito claro',
];

const NEGATIVE_TAGS = [
  'Muito denso',
  'Ficou raso',
  'Quiz fraco',
  'Falta exemplo',
];

const STORAGE_PREFIX = 'ffv_rating_tags';

function loadTags(slug: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${slug}`);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveTags(slug: string, tags: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}:${slug}`, JSON.stringify(Array.from(tags)));
  } catch { /* storage cheio */ }
}

export function ModuleRating({ slug }: Props) {
  const { state, rate } = useGameState();
  const current = state?.moduleRatings[slug] ?? null;
  const [tags, setTags] = useState<Set<string>>(() => new Set());

  // Hidrata tags do storage ao montar e a cada mudança de slug.
  useEffect(() => {
    setTags(loadTags(slug));
  }, [slug]);

  function toggleTag(tag: string) {
    setTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      saveTags(slug, next);
      return next;
    });
  }

  const showTags = current !== null;
  const tagPool = current === 1 ? POSITIVE_TAGS : NEGATIVE_TAGS;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 12, color: 'var(--ffv-muted)' }}>Este módulo foi útil?</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => rate(slug, 1)}
            aria-label="Sim, foi útil"
            aria-pressed={current === 1}
            style={{
              background: current === 1
                ? 'color-mix(in srgb, var(--ffv-green) 15%, transparent)'
                : 'var(--ffv-bg2)',
              border: `1px solid ${current === 1 ? 'color-mix(in srgb, var(--ffv-green) 40%, transparent)' : 'var(--ffv-border)'}`,
              color: current === 1 ? 'var(--ffv-green)' : 'var(--ffv-muted)',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            <ThumbsUp size={13} fill={current === 1 ? 'currentColor' : 'none'} strokeWidth={1.8} />
            Sim
          </button>
          <button
            type="button"
            onClick={() => rate(slug, -1)}
            aria-label="Não, não foi útil"
            aria-pressed={current === -1}
            style={{
              background: current === -1
                ? 'color-mix(in srgb, var(--ffv-red) 12%, transparent)'
                : 'var(--ffv-bg2)',
              border: `1px solid ${current === -1 ? 'color-mix(in srgb, var(--ffv-red) 35%, transparent)' : 'var(--ffv-border)'}`,
              color: current === -1 ? 'var(--ffv-red)' : 'var(--ffv-muted)',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            <ThumbsDown size={13} fill={current === -1 ? 'currentColor' : 'none'} strokeWidth={1.8} />
            Não
          </button>
        </div>
      </div>

      {/* Tags estruturadas — aparecem após avaliação inicial */}
      {showTags && (
        <div className="flex flex-col gap-2" role="group" aria-label="Tags de feedback">
          <span style={{ fontSize: 11, color: 'var(--ffv-muted)' }}>
            {current === 1 ? 'O que mais te ajudou?' : 'O que faltou?'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tagPool.map(tag => {
              const selected = tags.has(tag);
              const tone = current === 1 ? 'var(--ffv-green)' : 'var(--ffv-red)';
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={selected}
                  style={{
                    background: selected ? `color-mix(in srgb, ${tone} 14%, transparent)` : 'transparent',
                    border: `1px solid ${selected ? `color-mix(in srgb, ${tone} 38%, transparent)` : 'var(--ffv-border)'}`,
                    color: selected ? tone : 'var(--ffv-muted)',
                    borderRadius: 999,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {selected && '✓ '}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
