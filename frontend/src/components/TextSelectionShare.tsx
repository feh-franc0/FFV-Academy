'use client';

import { useEffect, useRef, useState } from 'react';

interface TextSelectionShareProps {
  articleSlug: string;
  articleTitle: string;
}

/**
 * Detects text selection inside [data-article-root] and shows a floating
 * "Share on Twitter" tooltip. Only visible when ≥20 chars are selected.
 */
export function TextSelectionShare({ articleSlug, articleTitle }: TextSelectionShareProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPos(null);
        setSelectedText('');
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 20) {
        setPos(null);
        setSelectedText('');
        return;
      }
      // Only show for text inside the article
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer as Node;
      const article = document.querySelector('[data-article-root]');
      if (!article || !article.contains(container)) {
        setPos(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPos({
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + window.scrollY - 44,
      });
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    const quote = selectedText.length > 160 ? selectedText.slice(0, 157) + '…' : selectedText;
    const url = `https://fernandofrancovalle.com/aprenda/${articleSlug}`;
    const text = `"${quote}"\n\n— ${articleTitle}\n${url} via @feh_franc0`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer,width=560,height=480',
    );
    try {
      window.plausible?.('share-quote', { props: { slug: articleSlug } });
    } catch {}
  }

  if (!pos || !selectedText) return null;

  return (
    <div
      ref={tooltipRef}
      onMouseDown={e => e.preventDefault()}
      className="fixed z-50 pointer-events-auto"
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translateX(-50%)',
      }}
    >
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          background: '#1da1f2',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{ fontSize: 14 }}>𝕏</span>
        Compartilhar trecho
      </button>
      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -6,
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #1da1f2',
        }}
      />
    </div>
  );
}
