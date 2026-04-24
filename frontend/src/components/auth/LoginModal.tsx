'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { requestToken, verifyToken, googleLogin, MOCK_TOKEN, type UserProfile } from '@/lib/auth';
import { emailSchema, phoneBRSchema } from '@/lib/schemas';

const IS_DEV = process.env.NODE_ENV !== 'production';

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
        setError(IS_DEV ? `Código incorreto. Em dev use ${MOCK_TOKEN}.` : 'Código incorreto ou expirado. Tente novamente.');
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
        {/* Banner dev — visível apenas fora de produção */}
        {IS_DEV && (
          <div
            className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,193,7,0.12)', color: '#ffc107', border: '1px solid rgba(255,193,7,0.3)' }}
          >
            🧪 Dev · token {MOCK_TOKEN}
          </div>
        )}

        <h2 className="text-xl font-bold mb-2 pr-24">Entrar ou criar conta</h2>
        {reason && (
          <p className="text-sm mb-5" style={{ color: 'var(--ffv-muted)' }}>
            Precisamos confirmar sua identidade para {reason}.
          </p>
        )}

        {/* Botão Google — aparece sempre que o backend estiver configurado */}
        {process.env.NEXT_PUBLIC_API_BASE_URL && step === 'form' && (
          <>
            <button
              type="button"
              onClick={googleLogin}
              className="w-full flex items-center justify-center gap-3 text-sm font-semibold px-4 py-2.5 rounded-lg mb-3 transition-opacity hover:opacity-90"
              style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </button>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-px" style={{ background: 'var(--ffv-border)' }} />
              <span className="text-[11px]" style={{ color: 'var(--ffv-muted)' }}>ou com email</span>
              <div className="flex-1 h-px" style={{ background: 'var(--ffv-border)' }} />
            </div>
          </>
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
            {IS_DEV && (
              <p className="text-xs p-3 rounded-lg" style={{ background: 'rgba(88,166,255,0.08)', color: 'var(--ffv-blue)', border: '1px solid rgba(88,166,255,0.2)' }}>
                💡 Dev: use <b>{MOCK_TOKEN}</b>
              </p>
            )}

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
