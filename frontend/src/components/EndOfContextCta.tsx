'use client';

/**
 * EndOfContextCta — bloco final de cada hub, base e módulo.
 *
 * Comportamento condicional:
 *   - Anônimo: card "Crie conta" com 3 benefícios pedagógicos alinhados
 *     ao TEACHING_METHOD (salvar progresso, SRS, sugerir base nova).
 *   - Logado:  form `StudyRequestForm` em modo express pra pedir nova base
 *     de conhecimento, igual ao que aparece na home.
 *
 * Posicionamento: SEMPRE o último bloco visual antes do footer. Não é
 * intrusivo (não bloqueia leitura) porque só aparece ao fim do contexto.
 *
 * SSR-safe: durante hydration retorna null pra evitar mismatch entre
 * servidor (não sabe se está logado) e cliente.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { StudyRequestForm } from '@/components/home/StudyRequestForm';

interface Props {
  /**
   * Nome do contexto onde o CTA aparece — usado pra personalizar copy.
   * Ex.: "Hub de IA", "Trilha de AWS CLF-C02", "este módulo".
   * Opcional — sem ele a copy fica genérica.
   */
  contextLabel?: string;
}

export function EndOfContextCta({ contextLabel }: Props) {
  // null durante SSR/primeiro render; resolve no useEffect pra evitar mismatch.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!getCurrentUser());
  }, []);

  if (isLoggedIn === null) return null;

  // ─── Anônimo: CTA de criar conta com 3 benefícios ─────────────────────────
  if (!isLoggedIn) {
    return (
      <section
        className="px-6 py-16"
        style={{
          borderTop: '1px solid var(--ffv-border)',
          background: 'var(--ffv-bg2)',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="font-mono uppercase tracking-widest text-xs mb-3"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
          >
            ANTES DE CONTINUAR
          </p>
          <h2
            className="font-bold mb-4"
            style={{
              fontSize: 'clamp(1.4rem, 2.8vw, 2rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Crie sua conta gratuita pra estudar de verdade
          </h2>
          <p
            className="text-sm mb-8 max-w-xl mx-auto"
            style={{ color: 'var(--ffv-muted)' }}
          >
            {contextLabel
              ? `Você está em ${contextLabel}. `
              : ''}
            Sem conta, você lê e esquece em uma semana. Com conta, você aprende
            de verdade — 3 motivos:
          </p>
          <ul className="text-left max-w-xl mx-auto space-y-4 mb-8">
            <li className="flex gap-3 text-sm leading-relaxed">
              <span className="text-lg flex-shrink-0">📍</span>
              <span>
                <strong style={{ color: 'var(--foreground)' }}>
                  Salvar onde você parou
                </strong>{' '}
                <span style={{ color: 'var(--ffv-muted)' }}>
                  em cada hub e trilha. Volta exato no módulo certo, sem
                  reler tudo de novo.
                </span>
              </span>
            </li>
            <li className="flex gap-3 text-sm leading-relaxed">
              <span className="text-lg flex-shrink-0">🧠</span>
              <span>
                <strong style={{ color: 'var(--foreground)' }}>
                  Revisão espaçada automática
                </strong>{' '}
                <span style={{ color: 'var(--ffv-muted)' }}>
                  — mesma técnica que estudantes de medicina usam pra decorar
                  tudo. A FFV te lembra de revisar nos dias certos pra não
                  esquecer em 7 dias.
                </span>
              </span>
            </li>
            <li className="flex gap-3 text-sm leading-relaxed">
              <span className="text-lg flex-shrink-0">📚</span>
              <span>
                <strong style={{ color: 'var(--foreground)' }}>
                  Sugerir uma nova base de conhecimento
                </strong>{' '}
                <span style={{ color: 'var(--ffv-muted)' }}>
                  — faltou algum assunto? Manda o material (PDF, link, áudio)
                  e a FFV monta um plano de estudo com 100 questões em ~24h.
                </span>
              </span>
            </li>
          </ul>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-md text-sm font-semibold"
            style={{ background: 'var(--ffv-blue)', color: 'white' }}
          >
            Criar conta grátis (30s) →
          </Link>
          <p className="text-xs mt-3" style={{ color: 'var(--ffv-muted)' }}>
            100% gratuito · sem cartão · sem spam
          </p>
        </div>
      </section>
    );
  }

  // ─── Logado: form de pedir nova base ──────────────────────────────────────
  return (
    <section
      className="px-6 py-16"
      style={{
        borderTop: '1px solid var(--ffv-border)',
        background: 'var(--ffv-bg2)',
      }}
    >
      <div className="max-w-3xl mx-auto">
        <p
          className="font-mono uppercase tracking-widest text-xs mb-3 text-center"
          style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
        >
          SUGERIR NOVO CONTEÚDO
        </p>
        <h2
          className="font-bold mb-2 text-center"
          style={{
            fontSize: 'clamp(1.4rem, 2.8vw, 2rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Quer estudar outro assunto?
        </h2>
        <p
          className="text-sm mb-8 text-center max-w-xl mx-auto"
          style={{ color: 'var(--ffv-muted)' }}
        >
          {contextLabel
            ? `Continue além de ${contextLabel}. `
            : ''}
          Manda aqui o material (PDF, link, áudio, vídeo) — a FFV monta um
          plano de estudo com 100 questões em até 24h.
        </p>
        <StudyRequestForm />
      </div>
    </section>
  );
}
