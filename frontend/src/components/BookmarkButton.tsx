'use client';

import { Bookmark } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { toast } from '@/lib/toast';

interface Props {
  slug: string;
  size?: number;
  className?: string;
}

export function BookmarkButton({ slug, size = 16, className }: Props) {
  const { state, bookmark } = useGameState();
  const isBookmarked = state?.bookmarks.includes(slug) ?? false;

  function handleToggle() {
    const nowBookmarked = bookmark(slug);
    if (nowBookmarked) {
      toast.info('🔖 Salvo nos favoritos');
    } else {
      toast.info('Removido dos favoritos');
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isBookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      aria-pressed={isBookmarked}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '6px',
        color: isBookmarked ? 'var(--ffv-yellow)' : 'var(--ffv-muted)',
        transition: 'color 0.2s ease, transform 0.15s ease',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <Bookmark
        size={size}
        fill={isBookmarked ? 'currentColor' : 'none'}
        strokeWidth={1.8}
      />
    </button>
  );
}
