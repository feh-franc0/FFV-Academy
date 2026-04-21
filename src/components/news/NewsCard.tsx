'use client';

import { ArrowUpRight } from 'lucide-react';
import { brandFor, CATEGORY_LABEL, relativeDate, type NewsItem } from '@/lib/news';

export function NewsCard({ item, emphasis }: { item: NewsItem; emphasis?: 'hot' }) {
  const brand = brandFor(item.source);
  const isHot = emphasis === 'hot' || item.hot;

  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} — abrir em ${item.source} (nova aba)`}
      className="group relative block overflow-hidden rounded-2xl transition-transform hover:-translate-y-0.5"
      style={{
        border: '1px solid var(--ffv-border)',
        minHeight: 260,
        boxShadow: isHot ? '0 6px 24px color-mix(in srgb, ' + brand.from + ' 20%, transparent)' : 'none',
      }}
    >
      {/* Fundo: gradiente da marca (imagem "faux-photo" sem custo, sem licença) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${brand.from} 0%, ${brand.to} 55%, #0b0d11 120%)`,
        }}
      />
      {/* Textura sutil (noise via SVG inline) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
      {/* Sigla gigante no fundo (identidade visual da fonte) */}
      <div
        aria-hidden
        className="absolute -right-2 -bottom-4 font-bold tracking-tighter select-none"
        style={{
          fontSize: 120,
          lineHeight: 1,
          color: 'rgba(255,255,255,0.08)',
          fontFamily: 'var(--font-poppins), system-ui, sans-serif',
        }}
      >
        {item.source.slice(0, 1).toUpperCase()}
      </div>

      {/* Overlay escuro para legibilidade — mais forte em dark para ficar branco no texto */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, #000 25%, transparent) 0%, color-mix(in srgb, #000 72%, transparent) 70%, color-mix(in srgb, #000 85%, transparent) 100%)',
        }}
      />

      {/* Conteúdo */}
      <div className="relative flex flex-col justify-between h-full p-5" style={{ minHeight: 260 }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'rgba(255,255,255,0.14)',
                color: '#fff',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            >
              {item.source}
            </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.82)',
              }}
            >
              {CATEGORY_LABEL[item.category]}
            </span>
            {isHot && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: '#ff5a36',
                  color: '#fff',
                }}
              >
                🔥 HOT
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {relativeDate(item.publishedAt)}
          </span>
        </div>

        <div className="mt-auto">
          <h3
            className="font-bold leading-tight mb-2"
            style={{
              fontSize: 18,
              color: '#fff',
              fontFamily: 'var(--font-poppins), system-ui, sans-serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            {item.title}
          </h3>
          <p
            className="text-sm leading-snug line-clamp-3"
            style={{ color: 'rgba(255,255,255,0.82)' }}
          >
            {item.summary}
          </p>
          <div
            className="flex items-center gap-1 mt-3 text-xs font-semibold transition-opacity opacity-85 group-hover:opacity-100"
            style={{ color: '#fff' }}
          >
            <span>Ler em {item.source}</span>
            <ArrowUpRight size={14} strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </a>
  );
}
