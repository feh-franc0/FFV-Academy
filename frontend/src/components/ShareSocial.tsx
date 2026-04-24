'use client';

import { useState } from 'react';
import { getMyReferralId } from '@/lib/referral';
import { awardBadge } from '@/lib/engine';

interface ShareSocialProps {
  /** Slug do artigo, usado em URLs e métricas. */
  slug: string;
  /** Título do artigo (preferível em frase, sem aspas). */
  title: string;
  /** Cor de destaque da trilha (para o botão CTA). */
  accent?: string;
  /** Variante visual: "inline" (default) ou "compact". */
  variant?: 'inline' | 'compact';
}

/**
 * Botões de share social pra Twitter/X, LinkedIn e WhatsApp.
 * Pre-compõe texto + link com referral ID embutido.
 *
 * Sem dependência de backend. Cada botão abre intent URL nativa do serviço.
 * O click dispara evento Plausible 'share' com a rede.
 */
export function ShareSocial({ slug, title, accent = 'var(--ffv-blue)', variant = 'inline' }: ShareSocialProps) {
  const [copied, setCopied] = useState(false);

  function buildUrl(): string {
    const refId = getMyReferralId();
    const url = new URL(`https://fernandofrancovalle.com/aprenda/${slug}`);
    if (refId) url.searchParams.set('ref', refId);
    return url.toString();
  }

  function track(network: string) {
    try {
      window.plausible?.(
        'share',
        { props: { network, slug } }
      );
    } catch {}
    awardBadge('referrer');
    awardBadge('social_butterfly');
  }

  function shareTwitter() {
    const url = buildUrl();
    const text = `${title}\n\n— um artigo da FFV Academy 🚀`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, '_blank', 'noopener,noreferrer');
    track('twitter');
  }

  function shareLinkedIn() {
    const url = buildUrl();
    const intent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(intent, '_blank', 'noopener,noreferrer');
    track('linkedin');
  }

  function shareWhatsApp() {
    const url = buildUrl();
    const text = `${title} — ${url}`;
    const intent = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(intent, '_blank', 'noopener,noreferrer');
    track('whatsapp');
  }

  async function copyLink() {
    const url = buildUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      track('copy-link');
    } catch {}
  }

  const isCompact = variant === 'compact';

  return (
    <div
      className={`rounded-xl ${isCompact ? 'p-3' : 'p-4'}`}
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      {!isCompact && (
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ffv-muted)' }}>
          📣 Curtiu? Ajuda a espalhar
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <ShareBtn label="X / Twitter" icon="𝕏" onClick={shareTwitter} accent={accent} />
        <ShareBtn label="LinkedIn" icon="in" onClick={shareLinkedIn} accent={accent} />
        <ShareBtn label="WhatsApp" icon="W" onClick={shareWhatsApp} accent={accent} />
        <ShareBtn
          label={copied ? 'Copiado!' : 'Copiar link'}
          icon={copied ? '✓' : '🔗'}
          onClick={copyLink}
          accent={copied ? 'var(--ffv-green)' : accent}
        />
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
