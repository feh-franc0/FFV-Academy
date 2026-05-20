'use client';

/**
 * LandingClient v5 — Sales page premium · compacto + animado.
 *
 * Mudanças vs v4 (honestidade brutal aplicada):
 *  - Cortou 6 sections: Situation, Implication, NeedPayoff, GuideStatement,
 *    Audiencias, FinalCta. Página passa de 13 → 7 sections.
 *  - Hero compacto: headline 6 palavras, sub 1 frase, mockup ao LADO (não abaixo).
 *  - Gradient mesh animado de fundo (CSS-only, 60fps).
 *  - Scroll reveal nos cards (IntersectionObserver lazy).
 *  - Glow nos CTAs primary.
 *  - Tipografia mista: serif só no hero + 1 destaque por section.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { StudyRequestForm } from '@/components/home/StudyRequestForm';
import { HomeBaseRedirect } from '@/components/HomeBaseRedirect';

// ─── Design tokens locais ────────────────────────────────────────────────────

const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' };
const SANS: React.CSSProperties = { fontFamily: 'var(--font-inter)' };

const SECTION: React.CSSProperties = {
  paddingTop: 'clamp(64px, 9vw, 112px)',
  paddingBottom: 'clamp(64px, 9vw, 112px)',
};

const KICKER: React.CSSProperties = {
  ...SANS,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ffv-amber)',
};

const H_SECTION: React.CSSProperties = {
  ...SANS,
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  color: 'var(--ffv-ink)',
};

const LEAD: React.CSSProperties = {
  ...SANS,
  color: '#44403c',
  lineHeight: 1.6,
};

// ─── Hook util: scroll-triggered reveal ──────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.reveal = 'in';
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// ─── Export principal ────────────────────────────────────────────────────────

export function LandingClient() {
  return (
    <div style={{ background: 'var(--ffv-paper)', color: 'var(--ffv-ink)' }}>
      {/* Regra de personalização P0 — usuário com homeBase setado é
          redirecionado pra base preferida. Renderiza null, mas usa hook
          de pathname/preferences pra disparar router.replace.
          Escape: ?nohome=1 na URL. */}
      <HomeBaseRedirect />

      <Hero />
      <ChatGPTBattle />
      <PadraoFFV />
      <Steps />
      <ProvaViva />
      <Faq />
      <FormSection />
    </div>
  );
}

// ─── 1. Hero v6 — dark startup/executive · gradient mesh + asymmetric ───────

function Hero() {
  return (
    <section
      className="relative px-6 lg:px-10 overflow-hidden"
      style={{
        background: '#0a0a14',
        color: '#fff',
        paddingTop: 'clamp(96px, 13vw, 152px)',
        paddingBottom: 'clamp(80px, 11vw, 144px)',
      }}
    >
      {/* Camada 1: gradient mesh animado (blur grande) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -120,
          background: `
            radial-gradient(circle 640px at 18% 22%, rgba(124, 58, 237, 0.28), transparent 60%),
            radial-gradient(circle 540px at 82% 78%, rgba(251, 191, 36, 0.20), transparent 60%),
            radial-gradient(circle 480px at 50% 50%, rgba(56, 189, 248, 0.14), transparent 60%)
          `,
          filter: 'blur(48px)',
          animation: 'ffv-mesh-drift 18s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      {/* Camada 2: grid sutil */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.05fr,1fr] gap-12 lg:gap-20 items-center">
        <div>
          {/* Status pill com pulse dot */}
          <span
            className="inline-flex items-center gap-2 mb-7"
            style={{
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.86)',
              letterSpacing: '0.005em',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 0 4px rgba(34,197,94,0.18)',
                animation: 'ffv-pulse-dot 2.4s ease-in-out infinite',
              }}
            />
            2 bases no ar · em produção contínua
          </span>

          {/* HEADLINE bold sans-serif gigante */}
          <h1
            style={{
              fontFamily: 'var(--font-inter, system-ui), sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.8rem, 6.2vw, 5.6rem)',
              lineHeight: 0.97,
              letterSpacing: '-0.035em',
              marginBottom: 24,
              color: '#fff',
            }}
          >
            Educação que se{' '}
            <span
              style={{
                background:
                  'linear-gradient(115deg, #a78bfa 0%, #38bdf8 45%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              adapta a você
            </span>
            <br />
            em 24 horas.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-inter, system-ui), sans-serif',
              fontSize: 'clamp(1.05rem, 1.35vw, 1.2rem)',
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.68)',
              maxWidth: 560,
              marginBottom: 36,
              fontWeight: 400,
            }}
          >
            Você manda o material — PDFs, slides, edital. A FFV devolve uma escola
            completa em 24h: trilha estruturada, revisão espaçada calibrada e
            gamificação que retém. Curadoria humana, gratuito.
          </p>

          {/* CTAs gradient + ghost */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <a
              href="#solicitar-base"
              className="inline-flex items-center justify-center gap-2"
              style={{
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)',
                color: '#fff',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '-0.005em',
                boxShadow:
                  '0 10px 32px -6px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
                textDecoration: 'none',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 14px 38px -6px rgba(124,58,237,0.65), inset 0 1px 0 rgba(255,255,255,0.22)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow =
                  '0 10px 32px -6px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.18)';
              }}
            >
              Criar minha jornada
              <span aria-hidden style={{ fontSize: 13 }}>→</span>
            </a>
            <Link
              href="/bases"
              className="inline-flex items-center justify-center gap-2"
              style={{
                padding: '15px 30px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#fff',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: '-0.005em',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                textDecoration: 'none',
                transition: 'background 180ms ease, border-color 180ms ease',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
              }}
            >
              Explorar bases
            </Link>
          </div>

          {/* Stats em grid — números gigantes em sans bold */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 24,
              paddingTop: 28,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 16,
            }}
          >
            <HeroStat n="157" l="módulos de tech" />
            <HeroStat n="12" l="de Medicina Vet" />
            <HeroStat n="24h" l="SLA de entrega" />
            <HeroStat n="R$ 0" l="sem cartão" />
          </div>

          {/* Mini trust strip — preserva strings dos tests */}
          <p
            style={{
              fontSize: 11.5,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.01em',
              lineHeight: 1.6,
            }}
          >
            ✓ Curadoria humana revisa cada trilha · ✓ SRS científico ·{' '}
            <Link
              href="/stats-publicas"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'underline',
                textUnderlineOffset: 4,
                textDecorationColor: 'rgba(255,255,255,0.3)',
              }}
            >
              Ver nossas métricas públicas →
            </Link>
          </p>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

function HeroStat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--font-inter, system-ui), sans-serif',
          fontSize: 'clamp(1.9rem, 2.6vw, 2.4rem)',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.025em',
          lineHeight: 1,
        }}
      >
        {n}
      </p>
      <p
        style={{
          fontSize: 10.5,
          color: 'rgba(255,255,255,0.5)',
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          fontFamily: 'var(--font-inter, system-ui), sans-serif',
        }}
      >
        {l}
      </p>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative" aria-hidden>
      {/* Glow behind dashboard */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.22), transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="relative"
        style={{
          background: 'linear-gradient(180deg, #18182a 0%, #0f0f1d 100%)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px -16px rgba(0,0,0,0.6), 0 0 80px -20px rgba(124,58,237,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3f3f4a' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3f3f4a' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3f3f4a' }} />
          <span
            className="ml-3 font-mono text-[11px]"
            style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}
          >
            ffvacademy.com/minha-trilha
          </span>
          <span
            className="ml-auto text-[9px] font-mono uppercase px-2 py-0.5 rounded"
            style={{
              background: 'rgba(34,197,94,0.12)',
              color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.25)',
              letterSpacing: '0.1em',
              fontWeight: 700,
            }}
          >
            ● live
          </span>
        </div>

        <div className="grid grid-cols-[160px,1fr]" style={{ minHeight: 420 }}>
          {/* Sidebar dark */}
          <aside
            className="p-4"
            style={{
              borderRight: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <p
              className="text-[10px] font-mono uppercase mb-3"
              style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', fontWeight: 700 }}
            >
              Suas trilhas
            </p>
            <ul className="flex flex-col gap-1.5 text-xs list-none p-0 m-0">
              {[
                { name: 'Fundamentos', active: true },
                { name: 'Aplicações práticas', active: false },
                { name: 'Aprofundamento', active: false },
                { name: 'Exercícios guiados', active: false },
                { name: 'Revisão pra prova', active: false },
              ].map(t => (
                <li
                  key={t.name}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 6,
                    background: t.active ? 'rgba(124,58,237,0.18)' : 'transparent',
                    color: t.active ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontWeight: t.active ? 600 : 400,
                    fontSize: 12,
                    borderLeft: t.active
                      ? '2px solid #a78bfa'
                      : '2px solid transparent',
                  }}
                >
                  {t.name}
                </li>
              ))}
            </ul>

            {/* Mini XP card */}
            <div
              className="mt-4 p-2.5 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(56,189,248,0.08) 100%)',
                border: '1px solid rgba(167,139,250,0.2)',
              }}
            >
              <p
                className="text-[9px] font-mono uppercase mb-1"
                style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', fontWeight: 700 }}
              >
                XP semana
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 800,
                  fontSize: 22,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                +1240
              </p>
              <p style={{ fontSize: 10, color: '#22c55e', marginTop: 4, fontWeight: 600 }}>
                ↑ 18% vs semana anterior
              </p>
            </div>
          </aside>

          {/* Conteúdo principal */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[10px] font-mono uppercase"
                style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', fontWeight: 700 }}
              >
                Fundamentos · Módulo 3 de 8
              </p>
              <span
                className="text-[9px] font-bold uppercase px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(56,189,248,0.14)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56,189,248,0.25)',
                  letterSpacing: '0.1em',
                }}
              >
                Em curso
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                color: '#fff',
                marginBottom: 14,
              }}
            >
              Conceito-chave do tópico, explicado com clareza
            </h3>

            <div
              className="text-xs mb-4 px-3 py-2.5 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.6,
                borderLeft: '2px solid #a78bfa',
              }}
            >
              &ldquo;A ideia central começa pela definição precisa do problema,
              segue pela aplicação prática&hellip;&rdquo;
            </div>

            <ul className="flex flex-col gap-2 mb-4 list-none p-0">
              {[
                { t: 'Definição e contexto', done: true },
                { t: 'Exemplo prático comentado', done: true },
                { t: 'Aplicação no seu caso real', done: false },
                { t: 'Mini-quiz · 8 questões', done: false },
              ].map((m, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-xs"
                  style={{
                    color: m.done ? 'rgba(255,255,255,0.45)' : '#fff',
                    fontWeight: m.done ? 400 : 500,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 5,
                      background: m.done ? '#22c55e' : 'rgba(255,255,255,0.04)',
                      border: m.done ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    {m.done && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -1,
                          left: 3.5,
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </span>
                  <span style={{ textDecoration: m.done ? 'line-through' : 'none' }}>{m.t}</span>
                </li>
              ))}
            </ul>

            <div
              className="flex items-center justify-between text-[11px] pt-3"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <span>Progresso da trilha</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>2 de 8 · 25%</span>
            </div>
            <div
              className="mt-1.5 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div
                style={{
                  width: '25%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #a78bfa 0%, #38bdf8 100%)',
                  borderRadius: 999,
                  boxShadow: '0 0 12px rgba(167,139,250,0.6)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — Pronta em 24h */}
      <div
        className="absolute hidden md:flex items-center gap-2"
        style={{
          right: -18,
          top: -20,
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: '#0a0a14',
          padding: '10px 18px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '-0.005em',
          boxShadow:
            '0 12px 32px -6px rgba(251,191,36,0.5), 0 0 0 1px rgba(255,255,255,0.18) inset',
          transform: 'rotate(3deg)',
        }}
      >
        <span aria-hidden>⚡</span> Pronta em 24h
      </div>
    </div>
  );
}

// ─── 2. ChatGPT Battle (a peça-chave) ────────────────────────────────────────

function ChatGPTBattle() {
  const ref = useReveal();
  const rows = [
    { c: 'Texto enorme pra ler.',           f: 'Trilha com módulos ordenados.' },
    { c: 'Você pergunta, repergunta, repete.', f: 'Você envia uma vez. A jornada nasce pronta.' },
    { c: 'Sem exercícios. Sem teste.',      f: 'Quizzes integrados que validam o aprendizado.' },
    { c: 'Esquece em 7 dias.',              f: 'Revisão espaçada — você lembra no longo prazo.' },
    { c: 'Currículo genérico.',             f: 'Feita do seu material (PDF, slide, edital).' },
    { c: 'Você gerencia sozinho.',          f: 'Plataforma guia ritmo, progresso, próximo passo.' },
  ];

  return (
    <section
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{ ...SECTION, borderTop: '1px solid var(--ffv-border)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p style={KICKER}>O diferencial</p>
          <h2
            style={{
              ...H_SECTION,
              fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)',
              marginTop: 14,
              marginBottom: 14,
            }}
          >
            Resumo não é estudo.{' '}
            <em style={{ ...SERIF, fontStyle: 'italic', color: 'var(--ffv-amber)', fontWeight: 600 }}>
              Chat não é trilha.
            </em>
          </h2>
          <p style={{ ...LEAD, fontSize: 16 }}>
            ChatGPT, NotebookLM e Quizlet Magic Notes são ferramentas — não escolas. A FFV é o sistema completo: trilha + SRS + curadoria.
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '1px solid var(--ffv-border)',
            boxShadow: '0 12px 32px -12px rgba(28,25,23,0.12)',
          }}
        >
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ borderBottom: '1px solid var(--ffv-border)' }}
          >
            <div className="p-5 flex items-center justify-between" style={{ background: '#fdfbf6' }}>
              <h3 style={{ ...H_SECTION, fontSize: 17 }}>ChatGPT & similares</h3>
              <span
                className="text-[10px] font-mono uppercase"
                style={{ color: 'var(--ffv-muted)', letterSpacing: '0.14em' }}
              >
                Chat
              </span>
            </div>
            <div
              className="p-5 flex items-center justify-between"
              style={{ background: 'var(--ffv-ink)', color: '#faf7f2' }}
            >
              <h3 style={{ ...H_SECTION, color: '#faf7f2', fontSize: 17 }}>FFV Academy</h3>
              <span
                className="text-[10px] font-mono uppercase"
                style={{ color: '#fbbf24', letterSpacing: '0.14em' }}
              >
                Sistema de aprendizado
              </span>
            </div>
          </div>

          {/* Tabela detalhada FFV vs ChatGPT (6 linhas comparativas) */}
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--ffv-border)' : 'none' }}
            >
              <div
                className="p-5 text-sm flex items-start gap-3"
                style={{
                  color: '#78716c',
                  lineHeight: 1.55,
                  background: '#fdfbf6',
                  borderBottom: '1px solid var(--ffv-border)',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    marginTop: 3,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '1.5px solid #a8a29e',
                    color: '#a8a29e',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  ×
                </span>
                <span>{row.c}</span>
              </div>
              <div
                className="p-5 text-sm flex items-start gap-3"
                style={{
                  color: '#e7e0d0',
                  lineHeight: 1.55,
                  background: 'var(--ffv-ink)',
                  borderBottom: '1px solid #292524',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    marginTop: 2,
                    color: '#fbbf24',
                    fontWeight: 800,
                    fontSize: 17,
                    lineHeight: 1,
                  }}
                >
                  ✓
                </span>
                <span style={{ color: '#faf7f2' }}>{row.f}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 3 punchlines diretas nomeando cada concorrente — desarmam dúvida na hora. */}
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {[
            { rival: 'NotebookLM', eles: 'te dá um resumo do PDF.', nos: 'te dá uma escola.' },
            { rival: 'ChatGPT', eles: 'te responde uma vez.', nos: 'te treina toda semana.' },
            { rival: 'Anki', eles: 'te memoriza um card.', nos: 'te ensina antes.' },
          ].map(p => (
            <article
              key={p.rival}
              className="p-5 rounded-xl"
              style={{
                background: '#ffffff',
                border: '1px solid var(--ffv-border)',
                boxShadow: '0 4px 12px -6px rgba(28,25,23,0.06)',
              }}
            >
              <p
                className="text-[10px] font-mono uppercase mb-2"
                style={{ color: 'var(--ffv-muted)', letterSpacing: '0.14em', fontWeight: 700 }}
              >
                {p.rival}
              </p>
              <p style={{ ...SANS, fontSize: 14, color: '#78716c', lineHeight: 1.5 }}>
                {p.rival} {p.eles}
              </p>
              <p
                className="mt-2"
                style={{ ...SANS, fontSize: 15, color: 'var(--ffv-ink)', lineHeight: 1.45, fontWeight: 600 }}
              >
                A FFV {p.nos}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. Bento Grid v6 — features defensáveis em layout asymmetric ──────────

function PadraoFFV() {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{
        ...SECTION,
        background: '#0a0a14',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background gradient */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(167,139,250,0.10), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p
            style={{
              ...KICKER,
              color: '#a78bfa',
              fontWeight: 700,
              letterSpacing: '0.18em',
            }}
          >
            Padrão FFV
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-inter, system-ui), sans-serif',
              fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: 16,
              marginBottom: 16,
              color: '#fff',
            }}
          >
            Toda jornada nasce com os{' '}
            <span
              style={{
                background:
                  'linear-gradient(115deg, #a78bfa 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              mesmos 6 pilares
            </span>
            .
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.6,
            }}
          >
            Direito, design, medicina, marketing — o conteúdo muda, o padrão não.
          </p>
        </div>

        {/* Bento Grid: 4 colunas em desktop, asymmetric */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            gridAutoRows: 'minmax(200px, auto)',
          }}
        >
          {/* Card 1: Trilhas ordenadas — span 2 colunas */}
          <BentoCard
            span="md:col-span-7"
            accent="#a78bfa"
            title="Trilhas ordenadas"
            subtitle="Do básico ao avançado. Cada módulo constrói no anterior — sem buracos pedagógicos."
            visual={
              <div className="flex flex-col gap-1.5 mt-4">
                {['Fundamentos', 'Aplicações práticas', 'Aprofundamento'].map((t, i) => (
                  <div
                    key={t}
                    style={{
                      padding: '8px 12px',
                      background: i === 0
                        ? 'linear-gradient(90deg, rgba(167,139,250,0.18), transparent)'
                        : 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)',
                      borderLeft: i === 0 ? '2px solid #a78bfa' : '2px solid transparent',
                    }}
                  >
                    <span className="font-mono text-[10px] mr-2" style={{ opacity: 0.6 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {t}
                  </div>
                ))}
              </div>
            }
          />

          {/* Card 2: Revisão espaçada (SRS) — span 1 coluna */}
          <BentoCard
            span="md:col-span-5"
            accent="#38bdf8"
            title="Revisão espaçada"
            subtitle="SRS calibrado pelo SEU material. Traz de volta no tempo certo, com base no que você errou."
            visual={
              <div className="mt-4 flex items-end gap-1 h-16">
                {[40, 65, 30, 85, 55, 75, 95, 70].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      background: 'linear-gradient(180deg, #38bdf8, rgba(56,189,248,0.3))',
                      borderRadius: 2,
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>
            }
          />

          {/* Card 3: Exercícios integrados */}
          <BentoCard
            span="md:col-span-4"
            accent="#fbbf24"
            title="Exercícios integrados"
            subtitle="Você testa o aprendizado na hora. Feedback imediato com explicação."
            visual={
              <div className="mt-4 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2" style={{ color: '#22c55e' }}>
                  <span>✓</span> Q1 correta · +10 XP
                </div>
                <div className="flex items-center gap-2" style={{ color: '#22c55e' }}>
                  <span>✓</span> Q2 correta · +10 XP
                </div>
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span>○</span> Q3 em revisão
                </div>
              </div>
            }
          />

          {/* Card 4: Gamificação — span 2 cols */}
          <BentoCard
            span="md:col-span-5"
            accent="#22c55e"
            title="Gamificação inteligente"
            subtitle="XP, badges, streak, ranking. Ritmo > força de vontade."
            visual={
              <div className="mt-4 flex gap-2 flex-wrap">
                {[
                  { i: '🔥', v: '14d streak' },
                  { i: '⭐', v: 'Nível 7' },
                  { i: '🏆', v: '24 badges' },
                ].map(b => (
                  <span
                    key={b.v}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(34,197,94,0.10)',
                      border: '1px solid rgba(34,197,94,0.25)',
                      color: '#fff',
                    }}
                  >
                    {b.i} {b.v}
                  </span>
                ))}
              </div>
            }
          />

          {/* Card 5: Curadoria humana — span 3 cols (largo) */}
          <BentoCard
            span="md:col-span-3"
            accent="#f472b6"
            title="Curadoria humana"
            subtitle="Engenheiro revisa cada trilha antes de ir ao ar. Não é cuspe de LLM."
            visual={
              <div
                className="mt-4 text-[11px] flex items-center gap-2"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f472b6, #ec4899)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-hidden
                >
                  FFV
                </div>
                <span>Revisado por Fernando F. V.</span>
              </div>
            }
          />

          {/* Card 6: PT-BR mobile-first — span 9 cols (full) */}
          <BentoCard
            span="md:col-span-9"
            accent="#fbbf24"
            title="PT-BR nativo · qualquer dispositivo · zero cadastro pra começar"
            subtitle="Sem trial, sem cartão, sem app pra baixar. Funciona como PWA — instala no celular como app nativo se quiser."
            visual={
              <div
                className="mt-4 flex gap-2 text-[11px] flex-wrap"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {['🇧🇷 PT-BR nativo', '📱 PWA instalável', '⚡ Offline-first', '🔓 Sem cadastro'].map(
                  t => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-md"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {t}
                    </span>
                  ),
                )}
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

interface BentoCardProps {
  span: string; // tailwind cols, ex: "md:col-span-7"
  accent: string;
  title: string;
  subtitle: string;
  visual?: React.ReactNode;
}

function BentoCard({ span, accent, title, subtitle, visual }: BentoCardProps) {
  return (
    <article
      className={`col-span-12 ${span} p-6 lg:p-7 transition-all`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = `${accent}55`;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 12px 32px -8px ${accent}25`;
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Accent gradient corner */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${accent}25, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <h3
        style={{
          fontFamily: 'var(--font-inter, system-ui), sans-serif',
          fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.015em',
          marginBottom: 8,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13.5,
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.55,
        }}
      >
        {subtitle}
      </p>
      {visual}
    </article>
  );
}

// ─── 4. Steps (3 passos compactos) ───────────────────────────────────────────

function Steps() {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{ ...SECTION, borderTop: '1px solid var(--ffv-border)', background: '#fdfbf6' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p style={KICKER}>Em 3 passos</p>
          <h2
            style={{
              ...H_SECTION,
              fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)',
              marginTop: 14,
              marginBottom: 14,
            }}
          >
            Três passos seus,{' '}
            <em style={{ ...SERIF, fontStyle: 'italic', color: 'var(--ffv-amber)', fontWeight: 600 }}>
              vinte e quatro horas nossas
            </em>
            .
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: '1', t: 'Você conta o que estuda',  d: 'Área, matéria, objetivo. Leva 2 minutos.' },
            { n: '2', t: 'Envia seus materiais',      d: 'PDFs, slides, anotações. Opcional, mas potente.' },
            { n: '3', t: 'Recebe em 24h',             d: 'IA + curadoria entregam a jornada. Você começa a estudar.' },
          ].map(s => (
            <div key={s.n}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  style={{
                    ...SERIF,
                    fontSize: 46,
                    fontWeight: 700,
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, var(--ffv-amber), #c2410c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {s.n}
                </span>
                <span style={{ height: 1, flex: 1, background: 'var(--ffv-border)' }} />
              </div>
              <h3 style={{ ...H_SECTION, fontSize: 18, marginBottom: 8 }}>{s.t}</h3>
              <p className="text-sm" style={{ color: '#57534e', lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 5. Prova Viva ───────────────────────────────────────────────────────────

function ProvaViva() {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{ ...SECTION, borderTop: '1px solid var(--ffv-border)' }}
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr,1fr] gap-10 lg:gap-16 items-center">
        <div>
          <p style={KICKER}>Prova viva</p>
          <h2
            style={{
              ...H_SECTION,
              fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)',
              marginTop: 14,
              marginBottom: 18,
            }}
          >
            A primeira jornada{' '}
            <em style={{ ...SERIF, fontStyle: 'italic', color: 'var(--ffv-amber)', fontWeight: 600 }}>
              já está no ar
            </em>
            .
          </h2>
          <p style={{ ...LEAD, fontSize: 16, marginBottom: 28, maxWidth: 480 }}>
            Tecnologia é a vitrine do nosso padrão. 157 conteúdos, 16 trilhas, gamificação completa.
            A sua nasce com a mesma profundidade.
          </p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <Stat n="157" l="conteúdos" />
            <Stat n="16"  l="trilhas" />
            <Stat n="24h" l="entrega" />
          </div>

          {/* Intencional: /tecnologia é a base FLAGSHIP atual mostrada como
              prova viva. Quando outra base assumir esse papel, ajustar aqui
              ou ler de uma constant `FLAGSHIP_BASE` no registry. */}
          <Link
            href="/tecnologia"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              background: 'var(--ffv-ink)',
              color: '#fff',
              borderRadius: 10,
              boxShadow: '0 8px 20px -8px rgba(28,25,23,0.35)',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--ffv-navy)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--ffv-ink)')}
          >
            Explorar a base de Tecnologia
            <span aria-hidden style={{ fontSize: 12 }}>→</span>
          </Link>
        </div>

        <blockquote
          className="relative p-8 lg:p-10"
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid var(--ffv-border)',
            boxShadow: 'var(--ffv-shadow-soft)',
          }}
        >
          <span
            aria-hidden
            style={{
              ...SERIF,
              position: 'absolute',
              top: 0,
              left: 18,
              fontSize: 104,
              lineHeight: 1,
              color: 'var(--ffv-amber)',
              opacity: 0.16,
              fontWeight: 700,
            }}
          >
            “
          </span>
          <p
            style={{
              ...SERIF,
              fontStyle: 'italic',
              fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)',
              lineHeight: 1.5,
              color: 'var(--ffv-ink)',
              marginBottom: 24,
              position: 'relative',
            }}
          >
            A FFV não substitui sua faculdade — ela traduz o conteúdo confuso em uma jornada
            que finalmente faz sentido pra você aprender.
          </p>
          <footer className="flex items-center gap-3">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--ffv-ink)',
                color: '#fbbf24',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...SERIF,
                fontSize: 15,
                fontWeight: 800,
                fontStyle: 'italic',
              }}
            >
              FFV
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Fernando Franco Valle</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                Engenheiro · fundador FFV Academy
              </p>
            </div>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <p
        style={{
          ...SERIF,
          fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)',
          fontWeight: 700,
          color: 'var(--ffv-ink)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {n}
      </p>
      <p
        className="text-[11px] mt-1.5 uppercase"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.08em', fontWeight: 600 }}
      >
        {l}
      </p>
    </div>
  );
}

// ─── 6. FAQ ──────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'É gratuito mesmo? Até quando?',
    a: 'Sim. Na V1 (que é onde estamos agora, 2026), a montagem da base é 100% gratuita — sem cartão, sem plano, sem teste de 7 dias. Quando começarmos a cobrar por novos pedidos, quem já tem base aberta continua com ela. Nada de paywall retroativo.',
  },
  {
    q: 'Quanto tempo demora pra minha base ficar pronta?',
    a: 'Em média 12h. Limite de SLA é 24h. Se o material for muito grande (acima de 50 PDFs ou 300 páginas), pode levar um pouco mais — avisamos por email antes de começar.',
  },
  {
    q: 'Como é diferente do ChatGPT, NotebookLM e Anki?',
    a: 'ChatGPT te responde; ele esquece amanhã. NotebookLM te dá um resumo do PDF em 30 segundos. Anki tem SRS sofisticado (hoje FSRS-6), mas exige que você crie cada card sozinho. A FFV junta tudo num sistema: trilha sequencial → quiz → SRS calibrado pelo seu próprio material → ranking. Você entende, testa e revisa no tempo certo — não monta nada.',
  },
  {
    q: 'Posso mandar PDF da faculdade, da pós, do concurso?',
    a: 'Pode. Slides, anotações fotografadas, link público de Google Drive, gravação de aula em MP3 — qualquer coisa que represente o conteúdo. Quanto mais limpo o material, melhor a trilha que devolvemos.',
  },
  {
    q: 'Meu material é seguro? Vocês usam meus PDFs pra treinar IA?',
    a: 'Não. Não treinamos modelo nenhum com seu conteúdo. Os arquivos ficam armazenados pra gerar a sua base e pra você baixar depois. Acesso restrito à curadoria. Você pode pedir exclusão a qualquer momento (LGPD art. 18) em /preferencias.',
  },
  {
    q: 'Vou ter atendimento humano se algo der errado?',
    a: 'Sim. Toda base passa por revisão de um engenheiro humano antes de ir ao ar. Se você achar que algo ficou errado, manda um email pra fernandofv1110@gmail.com — quem responde é o engenheiro que montou. Sem chatbot, sem ticket.',
  },
  {
    q: 'E se eu já souber a matéria? Vou perder tempo com módulo básico?',
    a: 'A gente pergunta seu nível no formulário e calibra a trilha. Se você marcar "já sei o básico", a base começa direto no avançado. Você também pode pular módulos no app sem perder o XP da trilha.',
  },
  {
    q: 'Funciona pra qualquer área? Medicina, direito, design?',
    a: 'A V1 já tem tecnologia (157 módulos) e medicina veterinária (12 módulos + simulado) prontas. Outras áreas — medicina humana, direito, design, concurso, pós — abrem por demanda: você manda o pedido, a gente avalia e monta. Maio/2026 já tem fila ativa de medicina e OAB.',
  },
];

function Faq() {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{ ...SECTION, borderTop: '1px solid var(--ffv-border)' }}
    >
      <div className="max-w-3xl mx-auto">
        <p style={KICKER}>Perguntas frequentes</p>
        <h2
          style={{
            ...H_SECTION,
            fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)',
            marginTop: 14,
            marginBottom: 32,
          }}
        >
          Antes de você perguntar.
        </h2>

        <div style={{ borderTop: '1px solid var(--ffv-border)' }}>
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--ffv-border)' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-center justify-between gap-4 py-5"
        aria-expanded={open}
        style={{ background: 'transparent', cursor: 'pointer' }}
      >
        <span
          style={{
            ...SANS,
            fontSize: 'clamp(1rem, 1.3vw, 1.1rem)',
            fontWeight: 600,
            color: 'var(--ffv-ink)',
            letterSpacing: '-0.005em',
            lineHeight: 1.35,
          }}
        >
          {q}
        </span>
        <span
          aria-hidden
          style={{
            ...SERIF,
            fontSize: 22,
            color: 'var(--ffv-amber)',
            flexShrink: 0,
            transition: 'transform 200ms ease',
            transform: open ? 'rotate(45deg)' : 'none',
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>
      {open && (
        <p className="text-sm pb-6 pr-10" style={{ color: '#57534e', lineHeight: 1.65 }}>
          {a}
        </p>
      )}
    </div>
  );
}

// ─── 7. Form section ─────────────────────────────────────────────────────────

function FormSection() {
  const ref = useReveal();
  return (
    <section
      id="solicitar-base"
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{ ...SECTION, background: 'var(--ffv-ink)', color: '#faf7f2' }}
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr,1fr] gap-10 lg:gap-16 items-start">
        <div>
          <p style={{ ...KICKER, color: '#fbbf24' }}>Solicitar minha jornada</p>
          <h2
            style={{
              ...H_SECTION,
              color: '#faf7f2',
              fontSize: 'clamp(2rem, 3.6vw, 3rem)',
              marginTop: 14,
              marginBottom: 22,
            }}
          >
            Conte o que precisa aprender.{' '}
            <em
              style={{
                ...SERIF,
                fontStyle: 'italic',
                color: '#fbbf24',
                fontWeight: 700,
              }}
            >
              A gente devolve uma jornada pronta.
            </em>
          </h2>
          <p
            style={{
              ...SANS,
              fontSize: '1.05rem',
              color: '#d6d3d1',
              marginBottom: 32,
              maxWidth: 460,
              lineHeight: 1.6,
            }}
          >
            Leva 2 minutos. Você descreve, envia os materiais, e em até 24 horas sua jornada está no ar.
          </p>

          <ul className="flex flex-col gap-4 mb-8">
            {[
              { t: 'Pronta em até 24h · média de 12h', d: 'Avisamos por e-mail e WhatsApp. SLA visível.' },
              { t: 'Uma jornada, não um texto', d: 'Trilhas, módulos, quizzes, SRS científico — não chatbot.' },
              { t: 'Revisada por engenheiro humano', d: 'Cada base passa por revisão antes de ir ao ar.' },
              { t: 'Do seu material, qualquer área', d: 'PDFs, slides, apostilas, edital. Tech, vet, direito, design.' },
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  aria-hidden
                  style={{
                    ...SERIF,
                    fontSize: 20,
                    color: '#fbbf24',
                    fontWeight: 700,
                    fontStyle: 'italic',
                    lineHeight: 1,
                    marginTop: 2,
                    width: 28,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#faf7f2' }}>{p.t}</p>
                  <p className="text-sm" style={{ color: '#a8a29e', lineHeight: 1.5 }}>{p.d}</p>
                </div>
              </li>
            ))}
          </ul>

          <p
            className="text-xs"
            style={{
              color: '#a8a29e',
              borderLeft: '2px solid #fbbf24',
              paddingLeft: 14,
              lineHeight: 1.65,
            }}
          >
            <strong style={{ color: '#fbbf24' }}>Garantia honesta.</strong>{' '}
            V1 gratuita — sem cartão, sem assinatura, sem treinar IA com seu material. Se a trilha não te servir, avisa que a gente refaz. Sem ressentimento.
          </p>
        </div>

        <div className="lg:sticky lg:top-24">
          <StudyRequestForm />
        </div>
      </div>
    </section>
  );
}
