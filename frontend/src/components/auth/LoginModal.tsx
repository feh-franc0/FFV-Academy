'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { requestToken, verifyToken, MOCK_TOKEN, type UserProfile } from '@/lib/auth';
import { emailSchema, phoneBRSchema } from '@/lib/schemas';
import { trackEvent } from '@/lib/tracking';

const IS_DEV = process.env.NODE_ENV !== 'production';

interface Props {
  reason?: string;
  /** Pré-preenche e auto-submete o email — usado pelo formulário inline da home. */
  initialEmail?: string;
  /**
   * Pré-preenche o código de 6 dígitos. Usado pela página `/login?email=X&code=Y`
   * quando o estudante clica no botão "Confirmar e acompanhar status" do email
   * de boas-vindas pós-submit de study-request. Combinado com initialEmail,
   * o modal pula o passo de email e mostra o código já digitado — basta 1
   * clique no submit pra entrar.
   */
  initialCode?: string;
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
export function LoginModal({ reason, initialEmail, initialCode, onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState(initialEmail ?? '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  // Pré-preenche o código quando vem do magic-link do email pós-submit.
  // Sanitiza pra só dígitos (defesa contra valor estranho na URL).
  const [code, setCode] = useState(() =>
    (initialCode ?? '').replace(/\D/g, '').slice(0, 6),
  );

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

  // Auto-submete o email quando vem pré-preenchido do formulário inline da home
  useEffect(() => {
    if (!initialEmail?.trim()) return;
    const trimmed = initialEmail.trim();
    if (!emailSchema.safeParse(trimmed).success) return;
    setLoading(true);
    requestToken(trimmed)
      .then(result => setStep(result.isNewUser ? 'register' : 'code'))
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intencional: só executa uma vez ao montar

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
      // Track: começou fluxo de signup ou login conforme retorno do backend.
      // (NÃO logamos o email no metadata — backend já tem via header X-FFV-*.)
      trackEvent({
        eventType: result.isNewUser ? 'auth.signup_started' : 'auth.login_started',
        targetType: 'auth',
        targetId: result.isNewUser ? 'signup' : 'login',
        metadata: { fromReason: reason ?? null },
      });
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
      // Telefone é sempre coletado (mesmo com SMS desligado).
      // FEATURES.phoneAuth controla se o LOGIN por SMS está disponível;
      // a COLETA do número é sempre feita pra contato/recovery futuro.
      const normalized = normalizePhone(phone);
      if (!phoneBRSchema.safeParse(normalized).success) {
        return setError('Telefone inválido. Use formato (DD) 9 NNNN-NNNN');
      }
      // LGPD: consentimento de marketing é opcional — não pode bloquear o cadastro.
    }

    setLoading(true);
    try {
      const pendingRegistration = isRegister
        ? {
            name: name.trim(),
            phone: normalizePhone(phone),
            marketingConsent: consent,
          }
        : undefined;

      const result = await verifyToken(email.trim(), code, pendingRegistration);
      if (!result.ok || !result.user) {
        setError(IS_DEV ? `Código incorreto. Em dev use ${MOCK_TOKEN}.` : 'Código incorreto ou expirado. Tente novamente.');
        return;
      }
      // Track sucesso: distingue signup_completed (registro novo) vs
      // login_completed (retornante). O backend já vai receber o email no
      // próximo POST de tracking (snapshot do user já foi atualizado pelo
      // AuthProvider antes deste handler retornar).
      trackEvent({
        eventType: isRegister ? 'auth.signup_completed' : 'auth.login_completed',
        targetType: 'auth',
        targetId: isRegister ? 'signup' : 'login',
        metadata: { marketingConsent: isRegister ? consent : undefined },
      });
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
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-md rounded-2xl relative overflow-hidden"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Accent line topo */}
        <div
          className="h-0.5 w-full"
          style={{ background: 'linear-gradient(90deg, var(--ffv-blue) 0%, #a78bfa 50%, var(--ffv-green) 100%)' }}
        />

        <div className="p-7">
          {/* Logo + badge dev */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-black"
                style={{ background: 'color-mix(in srgb, var(--ffv-blue) 18%, transparent)', border: '1px solid color-mix(in srgb, var(--ffv-blue) 35%, transparent)', color: 'var(--ffv-blue)' }}
              >
                F
              </div>
              <span className="text-sm font-bold tracking-tight">FFV Academy</span>
            </div>
            {IS_DEV && (
              <div
                className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,193,7,0.1)', color: '#ffc107', border: '1px solid rgba(255,193,7,0.25)' }}
              >
                dev · {MOCK_TOKEN}
              </div>
            )}
          </div>

          {/* Título por step */}
          {step === 'email' && (
            <>
              <h2 className="text-2xl font-bold mb-1">Bem-vindo de volta</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)' }}>
                {reason ? `Para ${reason}, confirme seu email.` : 'Entre com seu email para continuar aprendendo.'}
              </p>
            </>
          )}
          {step === 'register' && (
            <>
              <h2 className="text-2xl font-bold mb-1">Criar sua conta</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)' }}>
                Primeira vez por aqui! Preencha os dados e use o código recebido.
              </p>
            </>
          )}
          {step === 'code' && (
            <>
              <h2 className="text-2xl font-bold mb-1">Verifique seu email</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)' }}>
                Enviamos um código de 6 dígitos para <strong style={{ color: 'var(--foreground)' }}>{email}</strong>.
              </p>
            </>
          )}

          {step === 'email' && (
            <form onSubmit={handleSubmitEmail} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ffv-muted)' }}>
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: 'var(--ffv-bg)',
                    border: '1px solid var(--ffv-border)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--ffv-blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--ffv-blue) 15%, transparent)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--ffv-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {error && (
                <p className="text-xs px-3 py-2 rounded-lg" role="alert" aria-live="assertive"
                  style={{ background: 'color-mix(in srgb, var(--ffv-red) 10%, transparent)', color: 'var(--ffv-red)', border: '1px solid color-mix(in srgb, var(--ffv-red) 25%, transparent)' }}>
                  {error}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: 'var(--ffv-muted)', background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, var(--ffv-blue) 0%, #60a5fa 100%)', color: '#0d1117' }}
                >
                  {loading ? 'Verificando…' : 'Continuar →'}
                </button>
              </div>
            </form>
          )}

          {(step === 'register' || step === 'code') && (
            <form onSubmit={handleSubmitCode} className="flex flex-col gap-4">
              {/* Banner de confirmação de envio */}
              <div
                className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs"
                style={{
                  background: 'color-mix(in srgb, var(--ffv-green) 8%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--ffv-green) 20%, transparent)',
                  color: 'var(--ffv-green)',
                }}
              >
                <span className="shrink-0 mt-0.5 text-sm">✉️</span>
                <span>Código enviado para <strong>{email}</strong>. Verifique sua caixa de entrada (e o spam).</span>
              </div>

              {step === 'register' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ffv-muted)' }}>
                      Nome completo
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--ffv-blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--ffv-blue) 15%, transparent)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--ffv-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ffv-muted)' }}>
                      Celular
                    </label>
                    <div
                      className="flex items-center rounded-xl overflow-hidden text-sm"
                      style={{ border: '1px solid var(--ffv-border)', background: 'var(--ffv-bg)' }}
                    >
                      <span
                        className="px-3 py-3 font-mono font-semibold select-none border-r shrink-0 text-xs"
                        style={{ color: 'var(--ffv-blue)', borderColor: 'var(--ffv-border)', background: 'color-mix(in srgb, var(--ffv-blue) 6%, transparent)' }}
                      >
                        +55
                      </span>
                      <input
                        type="tel"
                        autoComplete="tel-national"
                        required
                        value={phone}
                        onChange={formatPhone}
                        placeholder="(11) 98765-4321"
                        className="flex-1 px-3 py-3 bg-transparent outline-none"
                        style={{ color: 'var(--foreground)' }}
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-xs cursor-pointer" style={{ color: 'var(--ffv-muted)' }}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                      className="mt-0.5 flex-shrink-0 accent-[var(--ffv-blue)]"
                    />
                    <span>
                      <span className="opacity-60 mr-1">(opcional)</span>
                      Quero receber novidades por email. Leia nossa{' '}
                      <a href="/privacidade" style={{ color: 'var(--ffv-blue)' }}>política de privacidade</a>.
                    </span>
                  </label>
                </>
              )}

              {IS_DEV && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                  style={{ background: 'color-mix(in srgb, var(--ffv-blue) 8%, transparent)', color: 'var(--ffv-blue)', border: '1px solid color-mix(in srgb, var(--ffv-blue) 20%, transparent)' }}
                >
                  <span>💡</span>
                  <span>Dev: use o token <strong className="font-mono">{MOCK_TOKEN}</strong></span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ffv-muted)' }}>
                  Código de verificação
                </label>
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl font-mono tracking-[0.6em] px-4 py-4 rounded-xl outline-none transition-all"
                  style={{
                    background: 'var(--ffv-bg)',
                    border: '1px solid var(--ffv-border)',
                    color: 'var(--foreground)',
                    letterSpacing: '0.6em',
                  }}
                  placeholder="· · · · · ·"
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--ffv-blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--ffv-blue) 15%, transparent)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = code.length === 6 ? 'var(--ffv-green)' : 'var(--ffv-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {code.length > 0 && code.length < 6 && (
                  <p className="text-xs text-center" style={{ color: 'var(--ffv-muted)' }}>
                    {6 - code.length} dígito{6 - code.length !== 1 ? 's' : ''} restante{6 - code.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-xs px-3 py-2 rounded-lg" role="alert" aria-live="assertive"
                  style={{ background: 'color-mix(in srgb, var(--ffv-red) 10%, transparent)', color: 'var(--ffv-red)', border: '1px solid color-mix(in srgb, var(--ffv-red) 25%, transparent)' }}>
                  {error}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: 'var(--ffv-muted)', background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, var(--ffv-blue) 0%, #60a5fa 100%)', color: '#0d1117' }}
                >
                  {loading ? 'Validando…' : 'Entrar na conta'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
