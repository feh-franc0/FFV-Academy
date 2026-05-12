'use client';

import { ArrowUpRight } from 'lucide-react';
import { brandFor, CATEGORY_LABEL, relativeDate, type NewsItem } from '@/lib/news';
import { imageForItem } from '@/lib/news-imagery';

/**
 * NewsCard — design editorial com imagem real de fundo + mesh gradient overlay.
 *
 * Estratégia visual em camadas:
 *  1. <img> real cobre o card todo (Unsplash curado por categoria)
 *  2. Mesh gradient da marca — radial blurs com cores da source, multiply blend
 *  3. Overlay escuro inferior — garante legibilidade do texto
 *  4. Noise sutil — quebra banding e dá textura editorial
 *  5. Sigla da source no canto — identidade visual sem texto extra
 */
export function NewsCard({ item, emphasis }: { item: NewsItem; emphasis?: 'hot' | 'hero' }) {
  const brand = brandFor(item.source);
  const isHot = emphasis === 'hot' || item.hot;
  const isHero = emphasis === 'hero';
  const imageUrl = imageForItem(item);

  const minHeight = isHero ? 480 : 320;

  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} — abrir em ${item.source} (nova aba)`}
      className="group relative block overflow-hidden rounded-3xl transition-transform duration-300 hover:-translate-y-1"
      style={{
        border: '1px solid var(--ffv-border)',
        minHeight,
        boxShadow: isHero
          ? `0 30px 80px -20px color-mix(in srgb, ${brand.from} 30%, transparent)`
          : isHot
            ? `0 12px 40px -10px color-mix(in srgb, ${brand.from} 35%, transparent)`
            : '0 6px 20px -8px rgba(0,0,0,0.4)',
      }}
    >
      {/* CAMADA 1 — Imagem real de fundo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />

      {/* CAMADA 2 — Mesh gradient da marca (multiply para colorir a foto) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, ${brand.from}cc 0%, transparent 45%),
            radial-gradient(circle at 80% 30%, ${brand.to}b0 0%, transparent 50%),
            radial-gradient(circle at 50% 100%, #0b0d11ee 0%, transparent 60%)
          `,
          mixBlendMode: 'multiply',
        }}
      />

      {/* CAMADA 3 — Overlay escuro inferior para legibilidade */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.78) 75%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* CAMADA 4 — Noise editorial sutil */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* CAMADA 5 — Sigla source gigante decorativa */}
      <div
        aria-hidden
        className="absolute -right-3 -bottom-6 font-bold tracking-tighter select-none pointer-events-none"
        style={{
          fontSize: isHero ? 220 : 140,
          lineHeight: 1,
          color: 'rgba(255,255,255,0.07)',
          fontFamily: 'var(--font-poppins), system-ui, sans-serif',
        }}
      >
        {item.source.slice(0, 1).toUpperCase()}
      </div>

      {/* Conteúdo principal */}
      <div
        className={`relative flex flex-col justify-between h-full ${isHero ? 'p-8 md:p-10' : 'p-6'}`}
        style={{ minHeight }}
      >
        {/* Pills topo */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {item.source}
            </span>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium"
              style={{
                background: 'rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              {CATEGORY_LABEL[item.category]}
            </span>
            {isHot && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{
                  background: 'linear-gradient(90deg, #ff5a36, #ff7a3c)',
                  color: '#fff',
                  boxShadow: '0 4px 12px -2px rgba(255,90,54,0.5)',
                }}
              >
                🔥 HOT
              </span>
            )}
          </div>
          <span
            className="text-[10px] font-mono px-2 py-1 rounded-full"
            style={{
              color: 'rgba(255,255,255,0.85)',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              letterSpacing: '0.04em',
            }}
          >
            {relativeDate(item.publishedAt)}
          </span>
        </div>

        {/* Título + summary */}
        <div className="mt-auto">
          <h3
            className="font-bold leading-tight mb-3"
            style={{
              fontSize: isHero ? 'clamp(1.5rem, 3vw, 2.4rem)' : 20,
              color: '#fff',
              fontFamily: 'var(--font-poppins), system-ui, sans-serif',
              textShadow: '0 2px 12px rgba(0,0,0,0.7)',
              letterSpacing: '-0.02em',
            }}
          >
            {item.title}
          </h3>
          <p
            className={`leading-relaxed ${isHero ? '' : 'line-clamp-3'}`}
            style={{
              color: 'rgba(255,255,255,0.88)',
              fontSize: isHero ? 16 : 14,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            {item.summary}
          </p>

          {/* Tags se hero */}
          {isHero && item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {item.tags.slice(0, 5).map(t => (
                <span
                  key={t}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div
            className="flex items-center gap-1.5 mt-5 text-xs font-bold transition-all opacity-90 group-hover:opacity-100 group-hover:gap-2.5"
            style={{ color: '#fff' }}
          >
            <span>Ler em {item.source}</span>
            <ArrowUpRight size={isHero ? 16 : 14} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Borda luminosa no hover */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${brand.from}80`,
        }}
      />
    </a>
  );
}
