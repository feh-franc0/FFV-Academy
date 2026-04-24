'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { requestToken, verifyToken, MOCK_TOKEN, type UserProfile } from '@/lib/auth';
import { emailSchema, phoneBRSchema } from '@/lib/schemas';

interface Props {
  reason?: string;
  onSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

type Step = 'form' | 'code';

/**
 * Modal de login mágico — 2 passos (dados + código 6 dígitos).
 *
 * Usa `role="dialog"` com backdrop clicável e ESC pra cancelar. Sem
 * dependência de Dialog primitivo de UI lib — consistente com
 * OnboardingModal existente no projeto.
 */
export function LoginModal({ reason, onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState('');

  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus();
  }, [step]);

  const handlePhoneChange = useCallback((raw: string) => {
    // Normalização BR: permite dígitos, +, espaço, ( ) - ; stripado em submit.
    setPhone(raw);
  }, []);

  const normalizePhone = useCallback((raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    // Aceita 10 ou 11 (sem DDI) ou 12-13 (com 55)
    if (digits.startsWith('55') && digits.length >= 12) return '+' + digits;
    if (digits.length >= 10 && digits.length <= 11) return '+55' + digits;
    return '+' + digits;
  }, []);

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) return setError('Nome muito curto');
    if (!emailSchema.safeParse(email.trim()).success) {
      return setError('Email inválido');
    }
    const normalized = normalizePhone(phone);
    if (!phoneBRSchema.safeParse(normalized).success) {
      return setError('Telefone inválido. Use formato (DD) 9 NNNN-NNNN');
    }
    if (!consent) {
      return setError('Você precisa aceitar os termos pra continuar');
    }

    setLoading(true);
    try {
      await requestToken(email.trim(), normalized);
      setStep('code');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) return setError('Código deve ter 6 dígitos');

    setLoading(true);
    try {
      const result = await verifyToken(email.trim(), code, {
        name: name.trim(),
        phone: normalizePhone(phone),
        marketingConsent: consent,
      });
      if (!result.ok || !result.user) {
        setError('Código incorreto. Use 000000 durante o experimento.');
        return;
      }
      onSuccess(result.user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Login"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-7 relative"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        {/* Banner dev */}
        <div
          className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,193,7,0.12)', color: '#ffc107', border: '1px solid rgba(255,193,7,0.3)' }}
        >
          🧪 Modo experimento · token {MOCK_TOKEN}
        </div>

        <h2 className="text-xl font-bold mb-2 pr-24">Entrar ou criar conta</h2>
        {reason && (
          <p className="text-sm mb-5" style={{ color: 'var(--ffv-muted)' }}>
            Precisamos confirmar sua identidade para {reason}.
          </p>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmitForm} className="flex flex-col gap-3">
            <label className="text-xs font-semibold" style={{ color: 'var(--ffv-muted)' }}>
              Nome completo
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-lg text-sm font-normal"
                style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
              />
            </label>

            <label className="text-xs font-semibold" style={{ color: 'var(--ffv-muted)' }}>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="mt-1 w-full px-3 py-2.5 rounded-lg text-sm font-normal"
                style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
              />
            </label>

            <label className="text-xs font-semibold" style={{ color: 'var(--ffv-muted)' }}>
              Celular (com DDD)
              <input
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                placeholder="(11) 98765-4321"
                className="mt-1 w-full px-3 py-2.5 rounded-lg text-sm font-normal"
                style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
              />
            </label>

            <label className="flex items-start gap-2 text-xs mt-2 cursor-pointer" style={{ color: 'var(--ffv-muted)' }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
              />
              <span>
                Aceito receber comunicações por email e SMS da FFV Academy (novos simulados, conteúdos e atualizações). Posso cancelar a qualquer momento em /preferencias. Leia nossa <a href="/privacidade" style={{ color: 'var(--ffv-blue)' }}>política de privacidade</a>. Conforme LGPD, seus dados são armazenados apenas neste dispositivo durante o experimento.
              </span>
            </label>

            {error && (
              <p className="text-xs" style={{ color: 'var(--ffv-red)' }}>{error}</p>
            )}

            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={onCancel}
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ color: 'var(--ffv-muted)', background: 'transparent' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50"
                style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
              >
                {loading ? 'Enviando código…' : 'Receber código'}
              </button>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleSubmitCode} className="flex flex-col gap-3">
            <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
              Enviamos um código de 6 dígitos para <b>{email}</b> e também por SMS para seu celular.
            </p>
            <p className="text-xs p-3 rounded-lg" style={{ background: 'rgba(88,166,255,0.08)', color: 'var(--ffv-blue)', border: '1px solid rgba(88,166,255,0.2)' }}>
              💡 Em desenvolvimento: use <b>000000</b>
            </p>

            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center text-2xl font-mono tracking-[0.5em] px-3 py-3 rounded-lg"
              style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
              placeholder="••••••"
            />

            {error && (
              <p className="text-xs" style={{ color: 'var(--ffv-red)' }}>{error}</p>
            )}

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ color: 'var(--ffv-muted)', background: 'transparent' }}
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50"
                style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
              >
                {loading ? 'Validando…' : 'Entrar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
