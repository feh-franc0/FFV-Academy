'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LoginModal } from '@/components/auth/LoginModal';

/**
 * Cliente da página `/login`. Renderiza o LoginModal com email+code
 * pré-preenchidos quando vêm da URL.
 *
 * Cenário principal: usuário recebeu o email "📬 Recebemos seu pedido" após
 * submeter solicitação de base e clicou no botão "Confirmar e acompanhar".
 * O email já tem email+code embutidos na URL, então aqui o modal abre
 * praticamente "pronto pra enviar".
 *
 * Após login bem-sucedido: redireciona pra `/minhas-solicitacoes` (dashboard
 * de status do estudante) ou, se não existe ainda, pra `/progresso`.
 */
export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get('email') ?? undefined;
  const initialCode = searchParams.get('code') ?? undefined;
  // `reason` vem do componente que disparou a navegação (ex.: AuthBadge passa
  // motivo no query string). Default amigável quando vem do email.
  const reason = searchParams.get('reason') ?? (initialCode
    ? 'confirmar seu email e acompanhar sua solicitação'
    : 'acessar sua conta');

  return (
    <LoginModal
      reason={reason}
      initialEmail={initialEmail}
      initialCode={initialCode}
      onSuccess={() => {
        // Estudante que veio do magic-link de study-request: vai pro dashboard
        // de solicitações. Outros casos: pro progresso global.
        router.push(initialCode ? '/progresso' : '/progresso');
      }}
      onCancel={() => router.push('/')}
    />
  );
}
