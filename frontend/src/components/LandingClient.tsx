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

// ─── 1. Hero (compacto + mesh + mockup ao lado) ──────────────────────────────

function Hero() {
  return (
    <section
      className="relative px-6 lg:px-10 overflow-hidden"
      style={{ paddingTop: 'clamp(96px, 12vw, 144px)', paddingBottom: 'clamp(48px, 6vw, 80px)' }}
    >
      <div aria-hidden className="ffv-landing-mesh">
        <span />
      </div>

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1fr,1.1fr] gap-10 lg:gap-16 items-center">
        <div>
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-6"
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid var(--ffv-border)',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--ffv-ink)',
              letterSpacing: '0.04em',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--ffv-sage)',
                boxShadow: '0 0 0 4px color-mix(in srgb, var(--ffv-sage) 22%, transparent)',
              }}
            />
            Pronta em 24 horas · Grátis na V1
          </span>

          <h1
            style={{
              ...SERIF,
              fontWeight: 700,
              fontSize: 'clamp(2.4rem, 5.5vw, 4.8rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.028em',
              marginBottom: 22,
            }}
          >
            Sua jornada de estudo,{' '}
            <em
              style={{
                fontStyle: 'italic',
                background: 'linear-gradient(135deg, var(--ffv-amber) 0%, #c2410c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
              }}
            >
              pronta amanhã.
            </em>
          </h1>

          <p
            style={{
              ...LEAD,
              fontSize: 'clamp(1.05rem, 1.25vw, 1.18rem)',
              maxWidth: 520,
              marginBottom: 32,
            }}
          >
            Envie o que precisa aprender. Em 24 horas, IA + curadoria entregam uma jornada
            completa — trilhas, conteúdo, exercícios, revisão. No mesmo padrão da nossa base de
            Tecnologia, que você pode visitar agora.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href="#solicitar-base"
              className="ffv-cta-glow inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-semibold"
              style={{
                background: 'var(--ffv-ink)',
                color: '#fff',
                borderRadius: 10,
                letterSpacing: '-0.005em',
                boxShadow: '0 10px 28px -8px rgba(28,25,23,0.4)',
              }}
            >
              Criar minha jornada
              <span aria-hidden style={{ fontSize: 12 }}>→</span>
            </a>
            <Link
              href="/bases"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-semibold transition-colors"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid var(--ffv-ink)',
                color: 'var(--ffv-ink)',
                borderRadius: 10,
                backdropFilter: 'blur(8px)',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'var(--ffv-ink)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
                e.currentTarget.style.color = 'var(--ffv-ink)';
              }}
            >
              Explorar bases existentes
            </Link>
          </div>

          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]"
            style={{ color: 'var(--ffv-muted)' }}
          >
            <span>✓ <strong style={{ color: 'var(--ffv-ink)' }}>157</strong> módulos de tech no ar</span>
            <span>✓ <strong style={{ color: 'var(--ffv-ink)' }}>12</strong> de Medicina Veterinária</span>
            <span>✓ Curadoria humana revisa cada trilha</span>
            <span>✓ Sem cartão · sem trial</span>
          </div>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative" aria-hidden>
      <div
        className="relative"
        style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid var(--ffv-border)',
          boxShadow:
            '0 1px 2px rgba(28,25,23,0.04), 0 24px 60px -16px rgba(28,25,23,0.18), 0 8px 24px -8px rgba(251,191,36,0.15)',
          overflow: 'hidden',
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid var(--ffv-border)', background: 'var(--ffv-cream)' }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e7e0d0' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e7e0d0' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e7e0d0' }} />
          <span
            className="ml-3 font-mono text-[11px]"
            style={{ color: 'var(--ffv-muted)' }}
          >
            ffvacademy.com/sua-jornada
          </span>
        </div>

        <div className="grid grid-cols-[150px,1fr]" style={{ minHeight: 400 }}>
          <aside
            className="p-4"
            style={{ borderRight: '1px solid var(--ffv-border)', background: '#fdfbf6' }}
          >
            <p
              className="text-[10px] font-mono uppercase mb-3"
              style={{ color: 'var(--ffv-muted)', letterSpacing: '0.1em' }}
            >
              Suas trilhas
            </p>
            <ul className="flex flex-col gap-2 text-xs">
              {[
                { name: 'Fundamentos',         active: true,  pct: 25 },
                { name: 'Aplicações práticas', active: false, pct: 0 },
                { name: 'Aprofundamento',      active: false, pct: 0 },
                { name: 'Exercícios guiados',  active: false, pct: 0 },
                { name: 'Revisão pra prova',   active: false, pct: 0 },
              ].map(t => (
                <li
                  key={t.name}
                  className="px-2 py-1.5 rounded"
                  style={{
                    background: t.active ? 'var(--ffv-cream)' : 'transparent',
                    color: t.active ? 'var(--ffv-ink)' : 'var(--ffv-muted)',
                    fontWeight: t.active ? 600 : 400,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 3,
                        height: 14,
                        background: t.active ? 'var(--ffv-amber)' : 'transparent',
                        borderRadius: 2,
                      }}
                    />
                    {t.name}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[10px] font-mono uppercase"
                style={{ color: 'var(--ffv-muted)', letterSpacing: '0.1em' }}
              >
                Fundamentos · Módulo 3 de 8
              </p>
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                style={{
                  background: 'color-mix(in srgb, var(--ffv-sage) 12%, transparent)',
                  color: 'var(--ffv-sage)',
                  letterSpacing: '0.08em',
                }}
              >
                ● No ar
              </span>
            </div>

            <h3
              style={{
                ...SERIF,
                fontSize: 23,
                fontWeight: 700,
                letterSpacing: '-0.015em',
                lineHeight: 1.15,
                color: 'var(--ffv-ink)',
                marginBottom: 14,
              }}
            >
              Conceito-chave do tópico, explicado com clareza
            </h3>

            <div
              className="text-xs mb-4 px-3 py-2 rounded"
              style={{
                background: 'var(--ffv-cream)',
                color: '#57534e',
                lineHeight: 1.6,
              }}
            >
              <span style={{ ...SERIF, fontStyle: 'italic' }}>
                &ldquo;A ideia central começa pela definição precisa do problema,
                segue pela aplicação prática...&rdquo;
              </span>
            </div>

            <ul className="flex flex-col gap-2 mb-4">
              {[
                { t: 'Definição e contexto',       done: true  },
                { t: 'Exemplo prático comentado',   done: true  },
                { t: 'Aplicação no seu caso real',  done: false },
                { t: 'Mini-quiz · 8 questões',      done: false },
              ].map((m, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-xs"
                  style={{ color: m.done ? 'var(--ffv-muted)' : 'var(--ffv-ink)' }}
                >
                  <span
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 4,
                      background: m.done ? 'var(--ffv-sage)' : 'transparent',
                      border: m.done ? 'none' : '1.5px solid var(--ffv-border)',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    {m.done && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -1,
                          left: 3,
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
              style={{ borderTop: '1px solid var(--ffv-border)', color: 'var(--ffv-muted)' }}
            >
              <span>Progresso da trilha</span>
              <span style={{ fontWeight: 600, color: 'var(--ffv-ink)' }}>2 de 8 · 25%</span>
            </div>
            <div
              className="mt-1.5 h-1 rounded-full overflow-hidden"
              style={{ background: 'var(--ffv-cream)' }}
            >
              <div
                style={{
                  width: '25%',
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--ffv-amber), #c2410c)',
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute hidden md:flex items-center gap-2"
        style={{
          right: -16,
          top: -18,
          background: 'var(--ffv-ink)',
          color: '#fbbf24',
          padding: '10px 16px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: '0 12px 24px -6px rgba(28,25,23,0.5)',
          transform: 'rotate(3deg)',
        }}
      >
        ✨ Pronta em 24h
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

// ─── 3. Padrão FFV ───────────────────────────────────────────────────────────

const PILLARS = [
  { ic: '🧱', t: 'Trilhas ordenadas',             d: 'Do básico ao avançado. Cada módulo constrói no anterior.' },
  { ic: '📖', t: 'Conteúdo explicado',             d: 'Não é texto solto. Explicações pensadas pra ensinar.' },
  { ic: '✏️', t: 'Exercícios integrados',          d: 'Você testa o aprendizado na hora. Feedback imediato.' },
  { ic: '🧠', t: 'Revisão espaçada',               d: 'Algoritmo científico (SM-2) que traz de volta no tempo certo.' },
  { ic: '🏆', t: 'Gamificação inteligente',        d: 'XP, badges, streak, ranking. Ritmo, não força de vontade.' },
  { ic: '🌐', t: 'PT-BR · qualquer dispositivo',   d: 'Acessa do desktop, tablet, celular. Estuda quando dá.' },
];

function PadraoFFV() {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{ ...SECTION, borderTop: '1px solid var(--ffv-border)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p style={KICKER}>O padrão FFV</p>
          <h2
            style={{
              ...H_SECTION,
              fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)',
              marginTop: 14,
              marginBottom: 14,
            }}
          >
            Toda jornada nasce com os{' '}
            <em style={{ ...SERIF, fontStyle: 'italic', color: 'var(--ffv-amber)', fontWeight: 600 }}>
              mesmos seis pilares
            </em>
            .
          </h2>
          <p style={{ ...LEAD, fontSize: 16 }}>
            Direito, design, medicina, marketing — o conteúdo muda, o padrão não.
          </p>
        </div>

        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{
            background: 'var(--ffv-border)',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid var(--ffv-border)',
          }}
        >
          {PILLARS.map(p => (
            <article
              key={p.t}
              className="p-7 transition-colors"
              style={{ background: '#ffffff' }}
              onMouseOver={e => (e.currentTarget.style.background = '#fdfbf6')}
              onMouseOut={e => (e.currentTarget.style.background = '#ffffff')}
            >
              <div className="text-2xl mb-3">{p.ic}</div>
              <h3 style={{ ...H_SECTION, fontSize: 16, marginBottom: 8 }}>{p.t}</h3>
              <p className="text-[13.5px]" style={{ color: '#57534e', lineHeight: 1.6 }}>
                {p.d}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
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
    a: 'ChatGPT te responde; ele esquece amanhã. NotebookLM te dá um resumo do PDF em 30 segundos. Anki te faz memorizar cards soltos. A FFV junta tudo num sistema: trilha sequencial → quiz → SRS científico → ranking. Você entende, testa e revisa no tempo certo — não fica refém de perguntar de novo.',
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
