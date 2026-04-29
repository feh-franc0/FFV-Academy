'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { requestToken, verifyToken, MOCK_TOKEN, type UserProfile } from '@/lib/auth';
import { emailSchema, phoneBRSchema } from '@/lib/schemas';

const IS_DEV = process.env.NODE_ENV !== 'production';

interface Props {
  reason?: string;
  onSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

// 'email'    → apenas email (passo 1)
// 'register' → nome + celular + consentimento + código (novo usuário)
// 'code'     → apenas código (usuário retornante)
type Step = 'email' | 'register' | 'code';

/**
 * Modal de login mágico — 3 passos:
 * 1. Email → verifica se é novo ou retornante.
 * 2a. Novo usuário: nome + celular + consentimento + código.
 * 2b. Retornante: apenas código.
 */
export function LoginModal({ reason, onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
    if (step === 'code' || step === 'register') codeInputRef.current?.focus();
  }, [step]);

  const normalizePhone = useCallback((raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length >= 12) return '+' + digits;
    if (digits.length >= 10 && digits.length <= 11) return '+55' + digits;
    return '+' + digits;
  }, []);

  const formatPhone = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = '';
    if (digits.length <= 2) formatted = digits.length ? `(${digits}` : '';
    else if (digits.length <= 6) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    else if (digits.length <= 10) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    else formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    setPhone(formatted);
  }, []);

  async function handleSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailSchema.safeParse(email.trim()).success) {
      return setError('Email inválido');
    }

    setLoading(true);
    try {
      const result = await requestToken(email.trim());
      setStep(result.isNewUser ? 'register' : 'code');
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

    const isRegister = step === 'register';

    if (isRegister) {
      if (name.trim().length < 2) return setError('Nome muito curto');
      const normalized = normalizePhone(phone);
      if (!phoneBRSchema.safeParse(normalized).success) {
        return setError('Telefone inválido. Use formato (DD) 9 NNNN-NNNN');
      }
      // LGPD: consentimento de marketing é opcional — não pode bloquear o cadastro.
    }

    setLoading(true);
    try {
      const pendingRegistration = isRegister
        ? { name: name.trim(), phone: normalizePhone(phone), marketingConsent: consent }
        : undefined;

      const result = await verifyToken(email.trim(), code, pendingRegistration);
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

        {step === 'email' && (
          <form onSubmit={handleSubmitEmail} className="flex flex-col gap-3">
            <label className="text-xs font-semibold" style={{ color: 'var(--ffv-muted)' }}>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="mt-1 w-full px-3 py-2.5 rounded-lg text-sm font-normal"
                style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
              />
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
                {loading ? 'Verificando…' : 'Continuar'}
              </button>
            </div>
          </form>
        )}

        {(step === 'register' || step === 'code') && (
          <form onSubmit={handleSubmitCode} className="flex flex-col gap-3">
            {step === 'register' && (
              <>
                <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                  Parece que é sua primeira vez! Preencha os dados abaixo e use o código que enviamos para <b>{email}</b>.
                </p>

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
                  Celular
                  <div className="mt-1 flex items-center rounded-lg overflow-hidden text-sm"
                    style={{ border: '1px solid var(--ffv-border)', background: 'var(--ffv-bg)' }}>
                    <span className="px-3 py-2.5 font-mono font-semibold select-none border-r shrink-0"
                      style={{ color: 'var(--ffv-blue)', borderColor: 'var(--ffv-border)', background: 'rgba(88,166,255,0.06)' }}>
                      +55
                    </span>
                    <input
                      type="tel"
                      autoComplete="tel-national"
                      required
                      value={phone}
                      onChange={formatPhone}
                      placeholder="(11) 98765-4321"
                      className="flex-1 px-3 py-2.5 bg-transparent outline-none font-normal"
                      style={{ color: 'var(--foreground)' }}
                    />
                  </div>
                </label>

                <label className="flex items-start gap-2 text-xs mt-1 cursor-pointer" style={{ color: 'var(--ffv-muted)' }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span>
                    <span className="text-[10px] uppercase tracking-wide mr-1" style={{ color: 'var(--ffv-muted)', opacity: 0.7 }}>(opcional)</span>
                    Quero receber novidades por email — novos simulados, conteúdos e atualizações. Posso cancelar quando quiser em /preferencias. Leia nossa <a href="/privacidade" style={{ color: 'var(--ffv-blue)' }}>política de privacidade</a>.
                  </span>
                </label>
              </>
            )}

            {step === 'code' && (
              <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                Enviamos um código de 6 dígitos para <b>{email}</b>.
              </p>
            )}

            {IS_DEV && (
              <p className="text-xs p-3 rounded-lg" style={{ background: 'rgba(88,166,255,0.08)', color: 'var(--ffv-blue)', border: '1px solid rgba(88,166,255,0.2)' }}>
                💡 Dev: use <b>{MOCK_TOKEN}</b>
              </p>
            )}

            <label className="text-xs font-semibold" style={{ color: 'var(--ffv-muted)' }}>
              Código de verificação
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1 w-full text-center text-2xl font-mono tracking-[0.5em] px-3 py-3 rounded-lg"
                style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
                placeholder="••••••"
              />
            </label>

            {error && (
              <p className="text-xs" style={{ color: 'var(--ffv-red)' }}>{error}</p>
            )}

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep('email')}
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
