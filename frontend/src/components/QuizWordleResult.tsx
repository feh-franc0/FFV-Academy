'use client';

import { useMemo, useState } from 'react';
import { getMyReferralId } from '@/lib/referral';

interface QuizWordleResultProps {
  /** Slug do módulo. */
  slug: string;
  /** Título do módulo. */
  title: string;
  /** Array de booleanos: true = acertou. */
  results: boolean[];
  /** Cor accent da trilha. */
  accent?: string;
}

/**
 * Card estilo Wordle pra share do resultado do quiz.
 * Gera string compacta com emojis e botões de share.
 *
 * Exemplo de output:
 *   FFV Academy — Subagents do Claude Code
 *   🟩🟩🟥 (2/3)
 *   fernandofrancovalle.com/aprenda/claude-code-subagents?ref=abc123
 */
export function QuizWordleResult({ slug, title, results, accent = 'var(--ffv-blue)' }: QuizWordleResultProps) {
  const [copied, setCopied] = useState(false);

  const score = results.filter(Boolean).length;
  const total = results.length;
  const isPerfect = score === total;

  const emojis = useMemo(
    () => results.map(r => (r ? '🟩' : '🟥')).join(''),
    [results]
  );

  const shareUrl = useMemo(() => {
    const refId = getMyReferralId();
    const url = new URL(`https://fernandofrancovalle.com/aprenda/${slug}`);
    if (refId) url.searchParams.set('ref', refId);
    return url.toString();
  }, [slug]);

  const shareText = useMemo(() => {
    const header = isPerfect ? '🎯 GABARITO!' : score >= total / 2 ? '💪' : '📖';
    return `${header} FFV Academy — ${title}\n${emojis} (${score}/${total})\n\n${shareUrl}`;
  }, [isPerfect, score, total, title, emojis, shareUrl]);

  function track(network: string) {
    try {
      window.plausible?.('quiz-share', {
        props: { network, slug, perfect: isPerfect },
      });
    } catch {}
  }

  function shareTwitter() {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(intent, '_blank', 'noopener,noreferrer');
    track('twitter');
  }

  function shareWhatsApp() {
    const intent = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(intent, '_blank', 'noopener,noreferrer');
    track('whatsapp');
  }

  function shareLinkedIn() {
    // LinkedIn não aceita texto pré-preenchido; mostramos o card e usuário cola
    copyText();
    const intent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(intent, '_blank', 'noopener,noreferrer');
    track('linkedin');
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      track('copy');
    } catch {}
  }

  return (
    <div
      className="rounded-xl p-5 mt-6"
      style={{
        background: 'var(--ffv-bg2)',
        border: `1px solid ${accent}40`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
          🪄 Compartilhe seu resultado
        </span>
      </div>

      {/* Wordle-style card preview */}
      <div
        className="rounded-lg p-4 mb-4 font-mono text-sm"
        style={{
          background: 'var(--ffv-bg)',
          border: '1px solid var(--ffv-border)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <div style={{ color: 'var(--ffv-muted)', fontSize: 11, marginBottom: 4 }}>FFV Academy</div>
        <div style={{ color: 'var(--foreground)', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 22, letterSpacing: 2, margin: '8px 0' }}>{emojis}</div>
        <div style={{ color: 'var(--ffv-muted)', fontSize: 11 }}>
          ({score}/{total}){isPerfect && ' · 🎯 perfeito'}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ShareBtn label="X / Twitter" icon="𝕏" onClick={shareTwitter} accent={accent} />
        <ShareBtn label="WhatsApp" icon="W" onClick={shareWhatsApp} accent={accent} />
        <ShareBtn label="LinkedIn" icon="in" onClick={shareLinkedIn} accent={accent} />
        <ShareBtn label={copied ? 'Texto copiado!' : 'Copiar texto'} icon={copied ? '✓' : '📋'} onClick={copyText} accent={copied ? 'var(--ffv-green)' : accent} />
      </div>
    </div>
  );
}

function ShareBtn({ label, icon, onClick, accent }: { label: string; icon: string; onClick: () => void; accent: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all hover:opacity-90"
      style={{
        background: 'var(--ffv-bg3)',
        border: `1px solid ${accent}40`,
        color: accent,
      }}
    >
      <span aria-hidden style={{ fontWeight: 700 }}>{icon}</span>
      {label}
    </button>
  );
}
