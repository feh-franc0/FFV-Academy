'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { toast } from '@/lib/toast';

/**
 * Form inline de newsletter — captura email e POST para Buttondown.
 *
 * Buttondown public form submission via fetch — não exige API key, usa o
 * formulário público do criador. URL: https://buttondown.com/api/emails/embed-subscribe/{username}
 *
 * Validação client-side básica (email regex). Plausible event ao sucesso.
 * Estados: idle | loading | success | error.
 */

type State = 'idle' | 'loading' | 'success' | 'error';

const BUTTONDOWN_USERNAME = 'fernandofrancovalle';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterInlineForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email)) {
      setError('Email inválido');
      return;
    }

    setState('loading');
    try {
      // Buttondown aceita FormData multipart no endpoint público
      const formData = new FormData();
      formData.append('email', email);

      await fetch(`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`, {
        method: 'POST',
        body: formData,
        mode: 'no-cors', // Buttondown não retorna CORS — sucesso assumido se não falhar
      });

      setState('success');
      track('signup_clicked', { from: 'newsletter_inline' });
      toast.success('Inscrição feita!', 'Confirme no email que enviamos.');
    } catch {
      setState('error');
      setError('Erro ao enviar. Tente novamente em alguns minutos.');
    }
  }

  if (state === 'success') {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: 'color-mix(in srgb, var(--ffv-green) 10%, var(--ffv-bg2))',
          border: '1px solid color-mix(in srgb, var(--ffv-green) 40%, transparent)',
        }}
      >
        <p className="text-2xl mb-2" aria-hidden>
          ✓
        </p>
        <p className="font-semibold text-sm">Inscrição feita!</p>
        <p className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>
          Confirme no email que enviamos para <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
      <label className="sr-only" htmlFor="newsletter-email">
        Seu email
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="seu@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={state === 'loading'}
        aria-invalid={!!error}
        aria-describedby={error ? 'newsletter-error' : undefined}
        className="flex-1 px-4 py-3 rounded-xl text-sm transition-colors"
        style={{
          background: 'var(--ffv-bg2)',
          border: `1px solid ${error ? 'var(--ffv-red)' : 'var(--ffv-border)'}`,
          color: 'var(--foreground)',
        }}
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        aria-busy={state === 'loading'}
        aria-label={state === 'loading' ? 'Enviando...' : 'Assinar newsletter'}
        className="px-5 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-[1.04] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'var(--ffv-green)',
          color: '#0d1117',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {state === 'loading' ? '...' : 'Assinar →'}
      </button>
      {error && (
        <p id="newsletter-error" role="alert" className="text-xs sm:basis-full" style={{ color: 'var(--ffv-red)' }}>
          {error}
        </p>
      )}
    </form>
  );
}
