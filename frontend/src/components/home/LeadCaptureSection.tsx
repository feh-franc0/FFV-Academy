'use client';

import { useState } from 'react';
import { LoginModal } from '@/components/auth/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile } from '@/lib/auth';
import { colorForInitials } from '@/lib/avatar-color';

const BENEFITS = [
  {
    icon: '🧠',
    title: '900+ artigos técnicos — não tutoriais',
    desc: 'Transformers, MVCC, RAG, sistemas distribuídos, LLMOps. O que engenheiros sênior realmente sabem.',
  },
  {
    icon: '⚡',
    title: 'Gamificação real — XP, badges, ranking',
    desc: 'Não é só "marque como lido". Cada módulo dá XP, streak diário mantém o ritmo, ranking mostra onde você está.',
  },
  {
    icon: '🔁',
    title: 'Revisão espaçada SM-2 — igual ao Anki',
    desc: 'Os quizzes viram flashcards com algoritmo científico. O intervalo aumenta conforme você acerta — memorização de longo prazo.',
  },
  {
    icon: '🆓',
    title: '100% gratuito — sem paywall',
    desc: 'Todo artigo, trilha, badge e ranking é gratuito. Sempre. Monetização é via simulados de certificação — não conteúdo bloqueado.',
  },
];

const SOCIAL_AVATARS = ['FV', 'AR', 'MS', 'JG', 'RP', 'LM'];

export function LeadCaptureSection() {
  const { isLoggedIn, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoggedIn) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setModalOpen(true);
  }

  async function handleSuccess(_user: UserProfile) {
    setModalOpen(false);
    await refresh();
  }

  return (
    <>
      <section
        className="px-6 py-20 relative overflow-hidden"
        style={{ borderTop: '1px solid var(--ffv-border)' }}
      >
        {/* Background glow sutil */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 80% 50%, color-mix(in srgb, var(--ffv-purple) 8%, transparent) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr,0.9fr] gap-16 items-start">
          {/* ── Lado esquerdo: storytelling ─────────────────────────── */}
          <div>
            <p
              className="font-mono uppercase tracking-widest text-xs mb-4"
              style={{ color: 'var(--ffv-purple)', letterSpacing: '0.12em' }}
            >
              Por que isso importa agora
            </p>

            <h2
              style={{
                fontSize: 'var(--text-4xl-r)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              O que separa um dev médio de um dev que{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                recebe as melhores ofertas?
              </span>
            </h2>

            <div
              className="space-y-4 text-sm"
              style={{ color: 'var(--ffv-muted)', lineHeight: 1.75, maxWidth: 560 }}
            >
              <p>
                A maioria dos devs aprendeu a <em>usar</em> IA. Poucos entendem como ela funciona
                por dentro. A diferença aparece na entrevista, na revisão de código, na hora de
                arquitetar um sistema.
              </p>
              <p>
                Quem sabe explicar o attention mechanism, por que o PostgreSQL usa MVCC, como RAG é
                diferente de embeddings simples — esses são os que estão sendo{' '}
                <strong style={{ color: 'var(--foreground)' }}>promovidos e contratados</strong>.
              </p>
              <p>
                Os que só copiam e colam de chatbots? Estão sendo{' '}
                <strong style={{ color: 'var(--foreground)' }}>substituídos por eles</strong>.
              </p>
            </div>

            {/* Benefits */}
            <ul className="mt-8 space-y-4">
              {BENEFITS.map(b => (
                <li key={b.icon} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">{b.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {b.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                      {b.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Lado direito: formulário de captação ─────────────────── */}
          <div className="lg:sticky lg:top-24">
            <div
              className="rounded-2xl p-7"
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
                boxShadow: '0 24px 60px -12px rgba(0,0,0,0.35)',
              }}
            >
              {/* Urgência / FOMO */}
              <div
                className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg text-xs font-semibold"
                style={{
                  background: 'color-mix(in srgb, var(--ffv-blue) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--ffv-blue) 25%, transparent)',
                  color: 'var(--ffv-blue)',
                }}
              >
                <span>🔥</span>
                <span>Devs estão se cadastrando agora — junte-se a eles</span>
              </div>

              <h3
                style={{
                  fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                Crie sua conta grátis
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                Em 30 segundos você começa a ganhar XP, subir no ranking e aprender de verdade.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="text-xs font-semibold" style={{ color: 'var(--ffv-muted)' }}>
                  Seu email
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className="mt-1.5 w-full px-4 py-3 rounded-xl text-sm font-normal"
                    style={{
                      background: 'var(--ffv-bg)',
                      border: '1px solid var(--ffv-border)',
                      color: 'var(--foreground)',
                      outline: 'none',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--ffv-blue)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--ffv-border)')}
                  />
                </label>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                    color: '#fff',
                    boxShadow: '0 8px 24px -6px color-mix(in srgb, var(--ffv-blue) 50%, transparent)',
                  }}
                >
                  Criar minha conta grátis →
                </button>
              </form>

              {/* Trust signals */}
              <p
                className="text-[11px] text-center mt-3"
                style={{ color: 'var(--ffv-muted)', letterSpacing: '0.03em' }}
              >
                🔒 LGPD · Sem spam · Cancele quando quiser
              </p>

              {/* Prova social */}
              <div
                className="flex items-center gap-3 mt-5 pt-5"
                style={{ borderTop: '1px solid var(--ffv-border)' }}
              >
                <div className="flex -space-x-2 shrink-0">
                  {SOCIAL_AVATARS.map((init, i) => (
                    <div
                      key={init}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                      style={{
                        background: colorForInitials(init),
                        color: '#fff',
                        borderColor: 'var(--ffv-bg2)',
                        zIndex: SOCIAL_AVATARS.length - i,
                      }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--foreground)' }}>Devs reais</strong> aprendendo aqui agora.{' '}
                  <span style={{ color: 'var(--ffv-green)' }}>●</span> Online agora
                </p>
              </div>

              {/* Authority */}
              <div
                className="mt-4 p-3 rounded-lg text-xs"
                style={{
                  background: 'color-mix(in srgb, var(--ffv-purple) 6%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--ffv-purple) 15%, transparent)',
                  color: 'var(--ffv-muted)',
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: 'var(--ffv-purple)', fontWeight: 600 }}>Sem paywall.</span>{' '}
                Todo o conteúdo técnico é gratuito para sempre. Nenhum módulo bloqueado, nenhum
                upsell. O conhecimento técnico não deveria ter preço.
              </div>
            </div>
          </div>
        </div>
      </section>

      {modalOpen && (
        <LoginModal
          reason="criar sua conta na FFV Academy"
          initialEmail={email}
          onSuccess={handleSuccess}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
