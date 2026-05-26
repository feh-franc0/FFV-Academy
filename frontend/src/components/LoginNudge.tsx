'use client';

/**
 * LoginNudge — card discreto bottom-right pra anônimo após engajamento real.
 *
 * Aparece APENAS quando o usuário:
 *  1. Não está logado
 *  2. Já viu ≥3 módulos OU completou ≥1 quiz (engajamento mínimo demonstrado)
 *  3. Não dismissou nas últimas 24h
 *
 * Renderizado no layout root (RootChrome). Dismiss persiste 24h via
 * localStorage (lib/login-nudge.ts).
 *
 * Tom: pedagógico, valor explícito (revisão espaçada + salvar progresso).
 * Não usa "Crie sua conta!" genérico — usa "pra revisar amanhã sem esquecer".
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { readNudgeState, shouldShowSticky, dismissStickyNudge } from '@/lib/login-nudge';

export function LoginNudge() {
  const [visible, setVisible] = useState(false);
  const [counters, setCounters] = useState({ modulesSeen: 0, quizzesDone: 0 });

  useEffect(() => {
    function check() {
      // Logado nunca vê.
      if (getCurrentUser()) {
        setVisible(false);
        return;
      }
      const state = readNudgeState();
      if (shouldShowSticky(state)) {
        setVisible(true);
        setCounters({ modulesSeen: state.modulesSeen, quizzesDone: state.quizzesDone });
      } else {
        setVisible(false);
      }
    }

    // Check inicial + periódico pra capturar mudanças de outros eventos
    // (PageTracker incrementa modulesSeen via storage event no mesmo tab? não.
    // Poll cada 5s é suficiente — barato e não-bloqueante).
    check();
    const id = window.setInterval(check, 5000);

    // Também ouve cross-tab via storage event (dismiss em outra aba some daqui)
    function onStorage(e: StorageEvent) {
      if (e.key?.startsWith('ffv_nudge_')) check();
    }
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(id);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (!visible) return null;

  // Copy contextual: prioriza menção a quizzes (sinal mais forte) sobre módulos
  const headline = counters.quizzesDone > 0
    ? 'Você acertou quiz hoje 🎯'
    : `Você leu ${counters.modulesSeen} módulos hoje 📚`;

  const subtext = counters.quizzesDone > 0
    ? 'Crie conta pra revisar isso daqui 3 dias sem esquecer — método de medicina aplicado a qualquer assunto.'
    : 'Crie conta pra salvar seu progresso e revisar nos dias certos. Leva 30s.';

  function handleDismiss() {
    dismissStickyNudge();
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Sugestão de cadastro"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl shadow-lg"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        padding: '16px',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          {headline}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dispensar"
          className="text-xs leading-none px-1 py-0.5 rounded hover:opacity-100 opacity-60"
          style={{ color: 'var(--ffv-muted)', cursor: 'pointer', background: 'transparent', border: 'none' }}
        >
          ✕
        </button>
      </div>
      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--ffv-muted)' }}>
        {subtext}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="flex-1 text-center px-3 py-2 rounded-md text-xs font-semibold"
          style={{ background: 'var(--ffv-blue)', color: 'white' }}
        >
          Criar conta grátis
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-2 rounded-md text-xs font-semibold"
          style={{
            background: 'transparent',
            border: '1px solid var(--ffv-border)',
            color: 'var(--ffv-muted)',
            cursor: 'pointer',
          }}
        >
          Mais tarde
        </button>
      </div>
    </div>
  );
}
