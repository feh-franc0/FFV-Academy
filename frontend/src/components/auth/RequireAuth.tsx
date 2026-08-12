'use client';

/**
 * RequireAuth — gate de autenticação para conteúdo protegido.
 *
 * - Se o usuário está logado: renderiza children normalmente.
 * - Se ainda está verificando a sessão: mostra esqueleto — decidido por
 *   `carregando` do contexto, NUNCA por `typeof window`. Ramo por ambiente
 *   dentro do render garante incompatibilidade de hidratação, e foi o defeito
 *   que a varredura de todas as telas encontrou em 05/ago/2026.
 * - Se não está logado: mostra mensagem de "login necessário" com botão que
 *   dispara o modal via requireLogin() do AuthContext.
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  children: React.ReactNode;
  /** Motivo exibido no modal de login (ex: "acessar os simulados"). */
  reason?: string;
  /** Mensagem de título exibida quando não está logado. */
  title?: string;
  /** Descrição adicional exibida quando não está logado. */
  description?: string;
}

export function RequireAuth({
  children,
  reason = 'acessar este conteúdo',
  title = 'Login necessário',
  description = 'Faça login para acessar os simulados e acompanhar seu progresso.',
}: Props) {
  const { isLoggedIn, carregando, requireLogin } = useAuth();
  const [triggering, setTriggering] = useState(false);

  // Enquanto o AuthProvider restaura a sessão (user === null mas ainda não
  // sabemos se há sessão), mostramos um skeleton discreto. Após a hydration
  // inicial, user passa a ser null (não autenticado) ou UserProfile.
  // Como não há como distinguir "loading" de "definitivamente deslogado" sem
  // estado extra, usamos uma heurística: se isLoggedIn é false E o componente
  // acabou de montar, pode ser loading. Mas o AuthProvider sempre define user
  // após o useEffect de restoreSession, então na prática o fluxo é:
  //   mount → user=null → restoreSession → user=UserProfile|null
  // Portanto mostramos o skeleton apenas quando user===null para evitar flash
  // de conteúdo protegido. Se há sessão, ela é restaurada antes do primeiro
  // render interativo.
  // Enquanto a sessão é restaurada, esqueleto — e o servidor renderiza o MESMO
  // esqueleto, porque `carregando` começa `true` nos dois lados.
  if (carregando) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        aria-busy="true"
        aria-label="Verificando autenticação…"
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--ffv-border)', borderTopColor: 'var(--ffv-red)' }}
        />
      </div>
    );
  }

  if (isLoggedIn) {
    return <>{children}</>;
  }

  // Não logado — mostra prompt de login
  async function handleLogin() {
    setTriggering(true);
    try {
      await requireLogin(reason);
      // requireLogin resolve quando o user faz login com sucesso — o AuthProvider
      // atualiza isLoggedIn e o componente re-renderiza com children.
    } catch {
      // Usuário fechou o modal sem logar — fica na tela de prompt
    } finally {
      setTriggering(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div
        className="max-w-md w-full text-center p-8 rounded-2xl"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        {/* Ícone de cadeado */}
        <div
          className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'color-mix(in srgb, var(--ffv-red) 15%, transparent)' }}
          aria-hidden="true"
        >
          🔒
        </div>

        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)' }}>
          {description}
        </p>

        <button
          onClick={handleLogin}
          disabled={triggering}
          className="w-full py-2.5 px-6 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
          style={{ background: 'var(--ffv-red)', color: 'var(--primary-foreground)' }}
        >
          {triggering ? 'Abrindo login…' : 'Fazer login'}
        </button>

        <p className="mt-4 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          É gratuito. Magic link por e-mail, sem senha.
        </p>
      </div>
    </div>
  );
}
