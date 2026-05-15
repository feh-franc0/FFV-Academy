'use client';

/**
 * TrailCompletionModal — celebra o fim de uma trilha completa.
 *
 * Trigger: ModuleLayout detecta, ao marcar o último módulo da trilha como completo,
 * que todos os slugs de `trail.modules` estão em `state.completedModules`.
 *
 * Mostra:
 * - Confetti CSS-only (emojis com fade + scale + rotate, respeitando prefers-reduced-motion)
 * - Nome da trilha + XP total ganho
 * - Badges desbloqueadas
 * - Compartilhar no LinkedIn (intent share com texto pré-preenchido)
 * - Ver certificado (linka /verificar?cert= ou /progresso como fallback)
 * - Continuar para a próxima trilha sugerida
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BADGES_DEF, CURRICULUM, type Trail } from '@/lib/curriculum';
import { Certificate } from '@/components/Certificate';
import { ShareSocial } from '@/components/ShareSocial';

export interface TrailCompletionModalProps {
  trail: Trail | null;
  totalXp: number;
  newBadges?: string[];
  certificateId?: string | null;
  /** Próxima trilha sugerida; se omitida, calculada como a próxima do CURRICULUM. */
  nextTrail?: Trail | null;
  onClose: () => void;
}

const CONFETTI_EMOJIS = ['🎉', '🎊', '✨', '🏆', '⭐', '🌟', '🎯', '💫'];

export function TrailCompletionModal({
  trail,
  totalXp,
  newBadges = [],
  certificateId = null,
  nextTrail,
  onClose,
}: TrailCompletionModalProps) {
  const [certOpen, setCertOpen] = useState(false);
  const [shareExpanded, setShareExpanded] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!trail) return null;

  const computedNext = nextTrail !== undefined
    ? nextTrail
    : (() => {
        const idx = CURRICULUM.findIndex(t => t.id === trail.id);
        return idx >= 0 && idx < CURRICULUM.length - 1 ? CURRICULUM[idx + 1] : null;
      })();

  const badges = newBadges
    .map(id => BADGES_DEF.find(b => b.id === id))
    .filter((b): b is NonNullable<typeof b> => !!b);

  const shareText = `Acabei de concluir a trilha "${trail.name}" no FFV Academy 🚀\n\n+${totalXp} XP · ${trail.modules.length} módulos · arquitetura real, sem hype.`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ffv.academy';
  const linkedInUrl =
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` +
    `&summary=${encodeURIComponent(shareText)}`;

  const certificateHref = certificateId
    ? `/verificar?cert=${encodeURIComponent(certificateId)}`
    : '/progresso';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Trilha ${trail.name} concluída`}
      className="fixed inset-0 z-[95] flex items-center justify-center px-4"
      style={{
        background: 'color-mix(in srgb, #000 65%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Confetti CSS-only — emojis posicionados absolutamente, animação fade+scale+rotate.
          Respeita prefers-reduced-motion via @media inline. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI_EMOJIS.map((emoji, i) => (
          <span
            key={i}
            data-testid="trail-confetti-piece"
            className="ffv-confetti"
            style={{
              position: 'absolute',
              left: `${(i * 12 + 6) % 100}%`,
              top: `${(i * 17) % 60}%`,
              fontSize: 28 + (i % 3) * 6,
              animationDelay: `${i * 120}ms`,
            }}
          >
            {emoji}
          </span>
        ))}
        <style>{`
          @keyframes ffv-confetti-pop {
            0%   { opacity: 0; transform: scale(0.4) rotate(-25deg); }
            30%  { opacity: 1; transform: scale(1.05) rotate(8deg); }
            60%  { opacity: 1; transform: scale(0.95) rotate(-6deg); }
            100% { opacity: 0; transform: scale(1.1) rotate(20deg) translateY(20px); }
          }
          .ffv-confetti {
            animation: ffv-confetti-pop 2.6s ease-out forwards;
            will-change: transform, opacity;
          }
          @media (prefers-reduced-motion: reduce) {
            .ffv-confetti {
              animation: none;
              opacity: 0.85;
              transform: none;
            }
          }
        `}</style>
      </div>

      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'var(--ffv-bg)',
          border: `1px solid ${trail.color}55`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 64px ${trail.color}22`,
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            padding: '32px 28px 22px',
            background: `radial-gradient(ellipse 80% 100% at 50% 0%, color-mix(in srgb, ${trail.color} 22%, transparent), transparent 70%)`,
            borderBottom: '1px solid var(--ffv-border)',
            textAlign: 'center',
          }}
        >
          <div
            className="font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: '0.18em', color: trail.color, fontWeight: 700, marginBottom: 12 }}
          >
            TRILHA COMPLETA
          </div>
          <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>{trail.icon}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Trilha {trail.name} completa!
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ffv-muted)', marginTop: 8 }}>
            {trail.modules.length} módulos · +{totalXp} XP totais
          </p>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {badges.length > 0 && (
            <div className="mb-5">
              <div
                className="font-mono uppercase mb-2"
                style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ffv-muted)', fontWeight: 700 }}
              >
                Badges desbloqueadas
              </div>
              <div className="flex flex-wrap gap-2">
                {badges.map(b => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                    style={{
                      background: 'var(--ffv-bg2)',
                      border: `1px solid ${trail.color}40`,
                    }}
                  >
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setCertOpen(true)}
              data-testid="trail-download-certificate"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
              style={{
                background: trail.color,
                color: '#0d1117',
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🏆 Baixar certificado (PNG)
            </button>

            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="trail-share-linkedin"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
              style={{
                background: '#0a66c2',
                color: '#fff',
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              <span>in</span>
              <span>Compartilhar no LinkedIn</span>
            </a>

            {!shareExpanded ? (
              <button
                type="button"
                onClick={() => setShareExpanded(true)}
                data-testid="trail-share-more"
                className="w-full text-center py-2.5 rounded-xl font-medium"
                style={{
                  background: 'transparent',
                  color: 'var(--ffv-muted)',
                  fontSize: 12,
                  border: '1px solid var(--ffv-border)',
                  cursor: 'pointer',
                }}
              >
                + Compartilhar em outras redes
              </button>
            ) : (
              <div data-testid="trail-share-social">
                <ShareSocial
                  slug={trail.id}
                  title={`Concluí a trilha "${trail.name}" no FFV Academy`}
                  accent={trail.color}
                  variant="compact"
                />
              </div>
            )}

            <Link
              href={certificateHref}
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium"
              style={{
                background: 'transparent',
                color: 'var(--ffv-muted)',
                fontSize: 12,
                textDecoration: 'none',
                border: '1px solid var(--ffv-border)',
              }}
            >
              Ver na página de verificação →
            </Link>

            {computedNext && (
              <Link
                href={computedNext.href ?? '/'}
                onClick={onClose}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl"
                style={{
                  background: 'var(--ffv-bg2)',
                  border: '1px solid var(--ffv-border)',
                  textDecoration: 'none',
                  color: 'var(--foreground)',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span style={{ fontSize: 18 }}>{computedNext.icon}</span>
                  <div className="min-w-0">
                    <div style={{ fontSize: 11, color: 'var(--ffv-muted)' }}>Próxima trilha</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{computedNext.name}</div>
                  </div>
                </div>
                <span style={{ color: computedNext.color, fontWeight: 700 }}>→</span>
              </Link>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-1 py-2.5 rounded-xl font-medium"
              style={{
                background: 'transparent',
                color: 'var(--ffv-muted)',
                fontSize: 12,
                border: '1px solid var(--ffv-border)',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {certOpen && <Certificate trailId={trail.id} onClose={() => setCertOpen(false)} />}
    </div>
  );
}
