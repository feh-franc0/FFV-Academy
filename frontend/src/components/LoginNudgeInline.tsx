'use client';

/**
 * LoginNudgeInline — card que aparece no fim do quiz/módulo pra anônimo
 * SALVAR o progresso que acabou de fazer.
 *
 * Diferente do sticky: este é contextual ao módulo atual e usa o momento
 * de pico de dopamina (acabou de acertar quizzes). Aparece SEMPRE que
 * anônimo termina um módulo, exceto se já dismissou nesta sessão.
 *
 * Dismiss persiste só na sessão (sessionStorage). Próxima aba/refresh
 * volta a aparecer — comportamento intencional pra não perder o momento.
 *
 * Tom: parabeniza + oferece valor concreto (revisar nos dias certos,
 * salvar onde parou). Sem "crie conta!" genérico.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import {
  readNudgeState,
  shouldShowInline,
  dismissInlineNudge,
} from '@/lib/login-nudge';

export function LoginNudgeInline({
  moduleTitle,
  correctAnswers,
  totalAnswers,
}: {
  /** Título do módulo lido (pra copy contextual). */
  moduleTitle?: string;
  /** Quantas respostas o usuário acertou no quiz deste módulo (se aplicável). */
  correctAnswers?: number;
  /** Total de perguntas no quiz. */
  totalAnswers?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Logado nunca vê
    if (getCurrentUser()) return;

    // Coexistência com PostReadSignupCta (cta/PostReadSignupCta.tsx): se o
    // post-read já apareceu nesta sessão (via scroll/tempo), não duplica o
    // pedido em segundos. Quem fez quiz E scrollou até o fim já viu o
    // post-read; o inline aqui seria barulho.
    try {
      if (window.sessionStorage.getItem('ffv:post_read_cta:session_shown') === '1') {
        return;
      }
    } catch {
      // sessionStorage indisponível — segue.
    }

    const state = readNudgeState();
    if (shouldShowInline(state)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  // Copy varia conforme contexto disponível
  const hasQuizScore = typeof correctAnswers === 'number' && typeof totalAnswers === 'number' && totalAnswers > 0;
  const headline = hasQuizScore
    ? `🎯 Você acertou ${correctAnswers} de ${totalAnswers}`
    : '📚 Você terminou este conteúdo';

  const subtitle = hasQuizScore
    ? 'Pra esse acerto virar memória permanente (e não esquecer em 1 semana), você precisa REVISAR nos dias certos. Crie conta — a FFV agenda a revisão automaticamente.'
    : 'Pra retomar de onde parou e revisar este conteúdo nos dias certos, salve seu progresso. Crie conta em 30s.';

  function handleDismiss() {
    dismissInlineNudge();
    setVisible(false);
  }

  return (
    <aside
      role="region"
      aria-label="Salve seu progresso"
      className="my-8 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--ffv-blue) 8%, transparent), color-mix(in srgb, var(--ffv-green, #15803d) 8%, transparent))',
        border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
        padding: '20px',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
          {headline}
        </h3>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dispensar"
          className="text-xs leading-none px-1 py-0.5 rounded opacity-50 hover:opacity-100"
          style={{ color: 'var(--ffv-muted)', cursor: 'pointer', background: 'transparent', border: 'none' }}
        >
          ✕
        </button>
      </div>
      {moduleTitle && (
        <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--ffv-muted)' }}>
          em <em>{moduleTitle}</em>
        </p>
      )}
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--ffv-muted)' }}>
        {subtitle}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/login"
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={{ background: 'var(--ffv-blue)', color: 'white' }}
        >
          Salvar progresso (30s)
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-2 rounded-md text-sm font-semibold"
          style={{
            background: 'transparent',
            border: '1px solid var(--ffv-border)',
            color: 'var(--ffv-muted)',
            cursor: 'pointer',
          }}
        >
          Continuar como visitante
        </button>
      </div>
    </aside>
  );
}
