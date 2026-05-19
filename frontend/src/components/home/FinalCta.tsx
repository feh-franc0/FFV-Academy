'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FfvButton } from '@/components/ui/ffv-button';
import { LoginModal } from '@/components/auth/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile } from '@/lib/auth';

interface Props {
  kicker?: string;
  /** Título principal — string ou JSX. */
  title?: React.ReactNode;
  description?: string;
  /** Se passado, renderiza um link/CTA estático em vez do form de email. */
  ctaHref?: string;
  ctaLabel?: string;
  /** Texto monospace abaixo do form/CTA. */
  footnote?: string;
}

const DEFAULT_TITLE = (
  <>
    O dev que você quer ser
    <br />
    <span
      style={{
        background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      começa a estudar hoje.
    </span>
  </>
);

const DEFAULT_DESCRIPTION =
  'Cada dia que passa, outros devs estão ganhando XP, completando trilhas e entendendo os internals que você ainda não aprendeu. O ranking não espera.';

export function FinalCta({
  kicker = 'Não deixe para amanhã',
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  ctaHref,
  ctaLabel = 'Começar agora →',
  footnote,
}: Props) {
  const { isLoggedIn, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setModalOpen(true);
  }

  async function handleSuccess(_user: UserProfile) {
    setModalOpen(false);
    await refresh();
  }

  const defaultFootnote = isLoggedIn ? 'CONTINUE DE ONDE PAROU' : '100% GRATUITO · LGPD · SEM SPAM';

  return (
    <>
      <section
        className="px-6 py-24 relative overflow-hidden"
        style={{ borderTop: '1px solid var(--ffv-border)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 100%, color-mix(in srgb, var(--ffv-blue) 12%, transparent) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <p
            className="font-mono uppercase tracking-widest text-xs mb-4"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.12em' }}
          >
            {kicker}
          </p>

          <h2
            style={{
              fontSize: 'var(--text-5xl)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            {title}
          </h2>

          <p
            style={{
              fontSize: 15,
              color: 'var(--ffv-muted)',
              maxWidth: 480,
              margin: '0 auto 36px',
              lineHeight: 1.75,
            }}
          >
            {description}
          </p>

          {ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold rounded-xl transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                color: '#fff',
                boxShadow: '0 8px 24px -6px color-mix(in srgb, var(--ffv-blue) 45%, transparent)',
                textDecoration: 'none',
              }}
            >
              {ctaLabel}
            </Link>
          ) : isLoggedIn ? (
            <FfvButton href="/mapa" variant="primary" size="xl">
              Ver meu progresso →
            </FfvButton>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="flex-1 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'var(--ffv-bg2)',
                  border: '1px solid var(--ffv-border)',
                  color: 'var(--foreground)',
                  outline: 'none',
                  minWidth: 0,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--ffv-blue)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--ffv-border)')}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all hover:scale-[1.02] shrink-0"
                style={{
                  background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                  color: '#fff',
                  boxShadow: '0 8px 24px -6px color-mix(in srgb, var(--ffv-blue) 45%, transparent)',
                }}
              >
                Começar agora →
              </button>
            </form>
          )}

          <p
            className="font-mono mt-4 text-[11px]"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
          >
            {footnote ?? defaultFootnote}
          </p>
        </div>
      </section>

      {modalOpen && (
        <LoginModal
          reason="criar sua conta na FFV Academy"
          initialEmail={email}
          onSuccess={handleSuccess}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
