'use client';

/**
 * SignupCTA — botão/banner que convida o visitante anônimo a criar conta.
 *
 * Decisão de produto (2026-05-21): usuário precisa de CTA visível pra criar
 * login com email + telefone + nome. O modal LoginModal já cobre todo o
 * fluxo (3 passos, validação Zod, magic link). Este componente apenas
 * dispara o modal com tracking automático de `cta.click`.
 *
 * Quando logado: não renderiza nada (caller esconde via gate).
 *
 * Variantes:
 *   - inline (default): botão grande no body de uma section
 *   - banner: faixa horizontal com texto + botão (pra topo de página)
 *   - hero: card grande com gradiente (landing principal)
 */

import { useAuth } from '@/hooks/useAuth';
import { trackEvent } from '@/lib/tracking';
import { useActiveBase } from '@/components/base/ActiveBaseContext';

interface Props {
  variant?: 'inline' | 'banner' | 'hero';
  /** Identifier do CTA pra rastreamento (ex: 'home-hero', 'medvet-end'). */
  ctaId: string;
  /** Texto do botão. Default: "Criar conta gratuita →". */
  label?: string;
  /** Subtítulo opcional pra variantes banner/hero. */
  subtitle?: string;
  /** Razão exibida no modal quando dispara requireLogin. */
  reason?: string;
  /** Esconde quando já logado (default true). */
  hideWhenLoggedIn?: boolean;
}

export function SignupCTA({
  variant = 'inline',
  ctaId,
  label = 'Criar conta gratuita →',
  subtitle,
  reason = 'criar sua conta',
  hideWhenLoggedIn = true,
}: Props) {
  const { isLoggedIn, requireLogin } = useAuth();
  const { base: activeBase } = useActiveBase();

  if (hideWhenLoggedIn && isLoggedIn) return null;

  function handleClick() {
    // Rastreia o clique antes de abrir o modal — admin vê funil "click → signup_started → signup_completed".
    trackEvent({
      eventType: 'cta.click',
      targetType: 'cta',
      targetId: ctaId,
      baseSlug: activeBase?.slug,
      metadata: { variant, label },
    });
    requireLogin(reason).catch(() => {
      /* usuário cancelou o modal — fluxo normal */
    });
  }

  if (variant === 'banner') {
    return (
      <section
        className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{
          background: 'color-mix(in srgb, var(--ffv-blue) 8%, transparent)',
          borderTop: '1px solid color-mix(in srgb, var(--ffv-blue) 25%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--ffv-blue) 25%, transparent)',
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">✨ Crie sua conta gratuita para acompanhar progresso</p>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--ffv-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, var(--ffv-blue) 0%, #60a5fa 100%)',
            color: '#0d1117',
          }}
        >
          {label}
        </button>
      </section>
    );
  }

  if (variant === 'hero') {
    return (
      <section
        className="px-6 py-12 rounded-2xl text-center flex flex-col items-center gap-4"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--ffv-blue) 14%, var(--ffv-bg2)) 0%, var(--ffv-bg2) 100%)',
          border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
        }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold max-w-xl">
          Crie sua conta e salve seu progresso
        </h2>
        {subtitle && (
          <p className="text-sm max-w-md" style={{ color: 'var(--ffv-muted)' }}>
            {subtitle}
          </p>
        )}
        {!subtitle && (
          <p className="text-sm max-w-md" style={{ color: 'var(--ffv-muted)' }}>
            Email + telefone + nome. Você recebe um código por email para entrar.
            Sem senha, sem fricção.
          </p>
        )}
        <button
          type="button"
          onClick={handleClick}
          className="px-6 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, var(--ffv-blue) 0%, #60a5fa 100%)',
            color: '#0d1117',
            boxShadow: '0 8px 24px color-mix(in srgb, var(--ffv-blue) 25%, transparent)',
          }}
        >
          {label}
        </button>
        <p className="text-[11px]" style={{ color: 'var(--ffv-muted)' }}>
          🔒 100% gratuito · 0 dados de cartão · LGPD-compliant
        </p>
      </section>
    );
  }

  // inline default
  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-5 py-2.5 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, var(--ffv-blue) 0%, #60a5fa 100%)',
        color: '#0d1117',
      }}
    >
      {label}
    </button>
  );
}
