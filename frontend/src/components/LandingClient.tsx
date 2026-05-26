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
import { TiltCard, Spotlight } from '@/components/ui/motion';

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
  color: '#5e8068', // SAGE_ACCENT — paleta sage warm
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

function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
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

// ─── Hook util: animated counter (count up quando entra em viewport) ─────────

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const t0 = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - t0) / duration);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(target * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, value };
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
      <ProcessoVisual />
      <AntesDepois />
      <ChatGPTBattle />
      <PadraoFFV />
      <Steps />
      <ProvaViva />
      <Faq />
      <FormSection />
    </div>
  );
}

// ─── Paleta — sage+cream+terracota (Aesop/Stripe/Notion DNA) ───────────────
// Sóbria, profissional, vet-friendly. Tom de clínica veterinária high-end +
// Apple-clean. Confortável pra todos os gêneros.

const SAGE_INK = '#1f3a30';
const SAGE_ACCENT = '#5e8068';
const SAGE_SOFT = '#dde6dd';
const PAPER = '#faf6ee';
const TEXT_MUTED = '#5f6b62';
const TERRACOTA = '#b8835a';

// ─── 1. Hero v8 — narrativa do fluxo + demo animado embutido ───────────────
// O Hero agora absorve o que era a section PlataformaEmAcao: kicker + headline
// explicando o fluxo (envia PDF → 24h → email com link → portal completo) +
// demo grande do browser auto-cyclando 4 telas (trilha · módulo · quiz · progresso).

function Hero() {
  return (
    <section
      className="relative px-6 lg:px-10 overflow-hidden ffv-aurora ffv-noise"
      style={{
        background: PAPER,
        color: SAGE_INK,
        paddingTop: 'clamp(80px, 11vw, 128px)',
        paddingBottom: 'clamp(64px, 9vw, 96px)',
      }}
    >
      {/* Partículas decorativas no fundo — pontos coloridos que pairam */}
      <div className="ffv-particles" aria-hidden />
      {/* Gradient mesh sage orgânico (light) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -120,
          background: `
            radial-gradient(circle 700px at 15% 25%, rgba(94, 128, 104, 0.14), transparent 60%),
            radial-gradient(circle 600px at 85% 80%, rgba(184, 131, 90, 0.10), transparent 60%),
            radial-gradient(circle 500px at 50% 50%, rgba(212, 165, 116, 0.06), transparent 70%)
          `,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      {/* Textura grid sutil */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(31,58,48,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31,58,48,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Brand tagline — backronym FFV ressignificado como slogan */}
        <div
          style={{
            fontFamily: 'var(--font-inter, system-ui), sans-serif',
            fontSize: 14,
            fontWeight: 500,
            color: TEXT_MUTED,
            marginBottom: 14,
            letterSpacing: '0.01em',
          }}
        >
          <strong style={{ fontWeight: 800, color: SAGE_INK, letterSpacing: '0.04em' }}>FFV</strong>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>·</span>
          <span style={{ fontStyle: 'italic' }}>Formação Focada em Você</span>
        </div>

        {/* Status pill sage */}
        <span
          className="inline-flex items-center gap-2 mb-7"
          style={{
            padding: '7px 14px',
            background: '#ffffff',
            border: `1px solid ${SAGE_SOFT}`,
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            color: SAGE_INK,
            letterSpacing: '0.005em',
            boxShadow: '0 1px 2px rgba(31,58,48,0.04)',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: SAGE_ACCENT,
              boxShadow: '0 0 0 4px rgba(94,128,104,0.18)',
              animation: 'ffv-pulse-dot 2.4s ease-in-out infinite',
            }}
          />
          Maio/2026: fila ativa de Medicina Vet e OAB
        </span>

        {/* HEADLINE */}
        <h1
          style={{
            fontFamily: 'var(--font-inter, system-ui), sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2.4rem, 5.4vw, 4.4rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            marginBottom: 22,
            color: SAGE_INK,
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          IA que transforma seus PDFs em{' '}
          {/* Highlight sweep — underline amarelo cresce 0→100% quando entra
              em viewport (efeito Linear / Stripe). */}
          <span
            className="ffv-highlight"
            data-reveal
            ref={useReveal<HTMLSpanElement>()}
            style={{ color: SAGE_ACCENT, fontStyle: 'italic', fontWeight: 600 }}
          >
            uma escola completa
          </span>
          {' '}no mesmo dia.
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-inter, system-ui), sans-serif',
            fontSize: 'clamp(1.05rem, 1.35vw, 1.2rem)',
            lineHeight: 1.6,
            color: TEXT_MUTED,
            maxWidth: 680,
            margin: '0 auto 28px',
            fontWeight: 400,
          }}
        >
          Manda os <strong style={{ color: SAGE_INK }}>PDFs, slides e anotações</strong> do que
          você precisa estudar. Nossa IA + curadoria humana montam <strong style={{ color: SAGE_INK }}>trilhas
          sequenciais, módulos com teoria, questões e revisão espaçada (SM-2)</strong> calibradas
          pelo SEU material. No mesmo dia o email chega com o link pra sua base completa.
          Não é chatbot. É a sua escola. Gratuito na V1.
        </p>

        {/* Flow strip — 3 etapas claras do fluxo */}
        <FlowStrip />

        {/* CTAs — mobile: full-width stacked, hit-target ≥48px. Desktop: inline. */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 px-4 sm:px-0">
          <a
            href="#solicitar-base"
            // ffv-shimmer: sweep diagonal sutil a cada 4s — chama atenção sem ser brega
            className="inline-flex items-center justify-center gap-2 ffv-shimmer w-full sm:w-auto"
            style={{
              padding: '16px 28px',
              minHeight: 48,
              background: SAGE_INK,
              color: PAPER,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.005em',
              boxShadow: '0 4px 14px -4px rgba(31,58,48,0.30)',
              transition: 'transform 200ms ease, box-shadow 200ms ease, background 200ms ease',
              textDecoration: 'none',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 22px -4px rgba(31,58,48,0.40)';
              e.currentTarget.style.background = '#152821';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 14px -4px rgba(31,58,48,0.30)';
              e.currentTarget.style.background = SAGE_INK;
            }}
          >
            <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Criar minha jornada
              <span aria-hidden style={{ fontSize: 13 }}>→</span>
            </span>
          </a>
          <Link
            href="/bases"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            style={{
              padding: '16px 28px',
              minHeight: 48,
              background: 'transparent',
              border: `1px solid ${SAGE_INK}`,
              color: SAGE_INK,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.005em',
              textDecoration: 'none',
              transition: 'background 180ms ease, color 180ms ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = SAGE_INK;
              e.currentTarget.style.color = PAPER;
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = SAGE_INK;
            }}
          >
            Explorar bases
            <span aria-hidden style={{ fontSize: 13 }}>↗</span>
          </Link>
        </div>

        {/* Demo ao vivo — badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: TERRACOTA,
              display: 'inline-block',
              animation: 'ffv-live-pulse 2s ease-in-out infinite',
            }}
            aria-hidden
          />
          <p style={{ ...KICKER, color: TERRACOTA, fontWeight: 700, margin: 0 }}>
            Demo ao vivo · 4 telas em loop
          </p>
        </div>

        {/* BROWSER DEMO grande — o protagonista */}
        <PlatformDemoSection />

        {/* Stats horizontal embaixo */}
        <div
          className="mt-12"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: 24,
            paddingTop: 28,
            borderTop: `1px solid ${SAGE_SOFT}`,
            marginBottom: 16,
            textAlign: 'left',
            maxWidth: 720,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <HeroStat n="157" l="módulos de tech" animate={157} />
          <HeroStat n="12" l="de Medicina Vet" animate={12} />
          <HeroStat n="24h" l="SLA de entrega" animate={24} />
          <HeroStat n="R$ 0" l="sem cartão" />
        </div>

        {/* Trust strip — preserva strings dos tests */}
        <p
          style={{
            fontSize: 12,
            color: TEXT_MUTED,
            letterSpacing: '0.01em',
            lineHeight: 1.65,
            textAlign: 'left',
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          <span style={{ color: SAGE_ACCENT, fontWeight: 700 }}>✓</span> Curadoria humana revisa cada trilha
          {'   '}
          <span style={{ color: SAGE_ACCENT, fontWeight: 700 }}>✓</span> SRS científico
          {'   '}
          <Link
            href="/stats-publicas"
            style={{
              color: SAGE_INK,
              textDecoration: 'underline',
              textUnderlineOffset: 4,
              textDecorationColor: 'rgba(31,58,48,0.3)',
              fontWeight: 600,
            }}
          >
            Métricas públicas →
          </Link>
        </p>
      </div>
    </section>
  );
}

// ─── FlowStrip — 3 etapas do fluxo "envia → 24h → portal" ────────────────
function FlowStrip() {
  const steps = [
    { i: '📄', l: 'Você envia', d: 'PDFs, slides, edital, anotações' },
    { i: '⚡', l: 'A FFV transforma', d: 'IA + curadoria humana no mesmo dia' },
    { i: '✉️', l: 'Email com link', d: 'Portal completo, personalizado' },
  ];
  // 3 pills entram em cascata cinematográfica (220ms cada). Conta a narrativa
  // do fluxo: envia → transforma → recebe.
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-reveal
      data-reveal-stagger-cinema
      className="flex flex-wrap items-center justify-center gap-3 mb-9"
    >
      {steps.map((s, i) => (
        <div key={s.l} className="flex items-center gap-3 ffv-cinema-item">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: '#ffffff',
              border: `1px solid ${SAGE_SOFT}`,
              boxShadow: '0 1px 2px rgba(31,58,48,0.04)',
              textAlign: 'left',
            }}
          >
            <span
              aria-hidden
              style={{
                fontSize: 22,
                width: 38,
                height: 38,
                borderRadius: 10,
                background: i === 1 ? `${SAGE_ACCENT}1a` : '#fcf9f1',
                border: `1px solid ${i === 1 ? `${SAGE_ACCENT}30` : SAGE_SOFT}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {s.i}
            </span>
            <div className="min-w-0">
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: SAGE_INK,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                {s.l}
              </p>
              <p className="text-[11px]" style={{ color: TEXT_MUTED, lineHeight: 1.35, marginTop: 2 }}>
                {s.d}
              </p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className="hidden sm:inline"
              style={{ color: SAGE_ACCENT, fontSize: 18, fontWeight: 700 }}
            >
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function HeroStat({ n, l, animate }: { n: string; l: string; animate?: number }) {
  const { ref, value } = useCountUp(animate ?? 0);
  const display = animate !== undefined ? `${value}${n.replace(/^\d+/, '')}` : n;
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <p
        style={{
          fontFamily: 'var(--font-inter, system-ui), sans-serif',
          fontSize: 'clamp(1.8rem, 2.4vw, 2.2rem)',
          fontWeight: 700,
          color: SAGE_INK,
          letterSpacing: '-0.025em',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {display}
      </p>
      <p
        style={{
          fontSize: 11,
          color: TEXT_MUTED,
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          fontWeight: 600,
          fontFamily: 'var(--font-inter, system-ui), sans-serif',
        }}
      >
        {l}
      </p>
    </div>
  );
}


// ─── 1.2 ProcessoVisual — animação do fluxo PDF → trilha → exercício ──────
// Section interativa que mostra a transformação em 3 colunas conectadas:
//   1. Material que você envia (3 file cards animados)
//   2. Processamento (loading orgânico)
//   3. Saída (trilha + exercício gerados)
// Animações CSS puras (zero JS), entram em loop sutil pra dar vida.

function ProcessoVisual() {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{
        ...SECTION,
        background: '#f6f1e6',
        borderTop: `1px solid ${SAGE_SOFT}`,
        overflow: 'hidden',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p style={{ ...KICKER, color: SAGE_ACCENT, fontWeight: 700 }}>
            Como funciona
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-inter, system-ui), sans-serif',
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: 16,
              marginBottom: 16,
              color: SAGE_INK,
            }}
          >
            Você manda. A FFV{' '}
            <span style={{ color: SAGE_ACCENT, fontStyle: 'italic', fontWeight: 600 }}>
              transforma
            </span>
            .
          </h2>
          <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.6 }}>
            Material espalhado em 3 colunas. Trilha pronta na quarta.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 lg:gap-4 items-stretch">
          {/* COLUNA 1 — PDFs que você envia */}
          <ProcessColumn
            step="01"
            label="Você envia"
            description="PDFs, slides, anotações, edital"
          >
            <div className="flex flex-col gap-2.5">
              {[
                { name: 'Edital_OAB_41.pdf', size: '2.4 MB', delay: 0 },
                { name: 'Slides_Genetica.pptx', size: '8.1 MB', delay: 0.3 },
                { name: 'Apostila_Cap03.pdf', size: '1.2 MB', delay: 0.6 },
              ].map(f => (
                <FileCard key={f.name} name={f.name} size={f.size} delay={f.delay} />
              ))}
            </div>
          </ProcessColumn>

          <FlowArrow />

          {/* COLUNA 2 — Processamento */}
          <ProcessColumn
            step="02"
            label="IA + curadoria"
            description="Em até 24h, com revisão humana"
            highlight
          >
            <div
              className="flex flex-col items-center justify-center gap-4"
              style={{ minHeight: 200 }}
            >
              {/* Loading orgânico — 3 dots pulsando */}
              <div className="flex gap-2">
                {[0, 0.2, 0.4].map(d => (
                  <span
                    key={d}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: SAGE_ACCENT,
                      animation: `ffv-bounce-dot 1.4s ease-in-out ${d}s infinite`,
                    }}
                  />
                ))}
              </div>
              <p
                className="text-xs text-center"
                style={{ color: TEXT_MUTED, lineHeight: 1.5, maxWidth: 180 }}
              >
                Lendo material<br />
                Estruturando trilha<br />
                Gerando exercícios
              </p>
              <div
                style={{
                  fontSize: 10,
                  color: SAGE_ACCENT,
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  background: '#fff',
                  border: `1px solid ${SAGE_ACCENT}40`,
                  borderRadius: 999,
                }}
              >
                ◐ Processando
              </div>
            </div>
          </ProcessColumn>

          <FlowArrow />

          {/* COLUNA 3 — Saída: Trilha + Exercício */}
          <ProcessColumn
            step="03"
            label="Você recebe"
            description="Trilha pronta + exercícios + revisão"
          >
            <div className="flex flex-col gap-2.5">
              {/* Trail card */}
              <div
                className="rounded-lg p-3"
                style={{
                  background: '#fff',
                  border: `1px solid ${SAGE_SOFT}`,
                  animation: 'ffv-slide-in 0.6s ease-out 0.4s both',
                }}
              >
                <p
                  className="text-[10px] font-mono uppercase mb-2"
                  style={{ color: SAGE_ACCENT, letterSpacing: '0.12em', fontWeight: 700 }}
                >
                  ✓ Trilha gerada
                </p>
                <ul className="flex flex-col gap-1 list-none p-0 m-0 text-[11px]">
                  {['01 · Direito Constitucional', '02 · Civil — Parte Geral', '03 · Penal'].map(
                    (t, i) => (
                      <li
                        key={t}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: i === 0 ? `${SAGE_ACCENT}14` : 'transparent',
                          color: i === 0 ? SAGE_INK : TEXT_MUTED,
                          fontWeight: i === 0 ? 600 : 400,
                          borderLeft:
                            i === 0 ? `2px solid ${SAGE_ACCENT}` : '2px solid transparent',
                          paddingLeft: 8,
                        }}
                      >
                        {t}
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* Quiz card */}
              <div
                className="rounded-lg p-3"
                style={{
                  background: '#fff',
                  border: `1px solid ${SAGE_SOFT}`,
                  animation: 'ffv-slide-in 0.6s ease-out 0.7s both',
                }}
              >
                <p
                  className="text-[10px] font-mono uppercase mb-2"
                  style={{ color: TERRACOTA, letterSpacing: '0.12em', fontWeight: 700 }}
                >
                  ✓ Exercício gerado
                </p>
                <p
                  className="text-xs mb-2"
                  style={{ color: SAGE_INK, fontWeight: 600, lineHeight: 1.4 }}
                >
                  Quanto à ação direta de inconstitucionalidade…
                </p>
                <div className="flex flex-col gap-1">
                  {['A', 'B', 'C', 'D'].map((opt, i) => (
                    <div
                      key={opt}
                      className="text-[10px] px-2 py-1 rounded flex items-center gap-2"
                      style={{
                        background: i === 1 ? `${SAGE_ACCENT}14` : '#fcf9f1',
                        border: i === 1 ? `1px solid ${SAGE_ACCENT}80` : `1px solid ${SAGE_SOFT}`,
                        color: i === 1 ? SAGE_INK : TEXT_MUTED,
                        fontWeight: i === 1 ? 600 : 400,
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{opt}</span>
                      <span>Alternativa {opt.toLowerCase()}</span>
                      {i === 1 && (
                        <span
                          style={{ marginLeft: 'auto', color: SAGE_ACCENT, fontWeight: 700 }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SRS card */}
              <div
                className="rounded-lg p-3 flex items-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${SAGE_ACCENT}14, ${TERRACOTA}10)`,
                  border: `1px solid ${SAGE_ACCENT}30`,
                  animation: 'ffv-slide-in 0.6s ease-out 1s both',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: SAGE_ACCENT,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  🧠
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-semibold"
                    style={{ color: SAGE_INK, lineHeight: 1.3 }}
                  >
                    SRS calibrado · 12 cards na fila
                  </p>
                  <p className="text-[10px]" style={{ color: TEXT_MUTED, marginTop: 1 }}>
                    Próxima revisão amanhã às 8h
                  </p>
                </div>
              </div>
            </div>
          </ProcessColumn>
        </div>
      </div>
    </section>
  );
}

interface ProcessColumnProps {
  step: string;
  label: string;
  description: string;
  highlight?: boolean;
  children: React.ReactNode;
}

function ProcessColumn({ step, label, description, highlight, children }: ProcessColumnProps) {
  return (
    <article
      className="rounded-2xl p-5 lg:p-6"
      style={{
        background: highlight
          ? `linear-gradient(180deg, #ffffff 0%, ${SAGE_ACCENT}08 100%)`
          : '#ffffff',
        border: highlight ? `2px solid ${SAGE_ACCENT}40` : `1px solid ${SAGE_SOFT}`,
        boxShadow: highlight
          ? `0 8px 24px -8px ${SAGE_ACCENT}30, 0 1px 2px rgba(31,58,48,0.04)`
          : '0 1px 2px rgba(31,58,48,0.04)',
        minHeight: 360,
      }}
    >
      <div className="flex items-baseline gap-2 mb-3">
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 11,
            fontWeight: 700,
            color: SAGE_ACCENT,
            letterSpacing: '0.12em',
            background: `${SAGE_ACCENT}14`,
            padding: '3px 8px',
            borderRadius: 4,
          }}
        >
          {step}
        </span>
        <h3
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 16,
            fontWeight: 700,
            color: SAGE_INK,
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </h3>
      </div>
      <p className="text-xs mb-4" style={{ color: TEXT_MUTED, lineHeight: 1.5 }}>
        {description}
      </p>
      {children}
    </article>
  );
}

function FlowArrow() {
  return (
    <div
      className="hidden lg:flex items-center justify-center"
      style={{ minWidth: 32 }}
      aria-hidden
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M4 14 L24 14 M18 8 L24 14 L18 20"
          stroke={SAGE_ACCENT}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function FileCard({ name, size, delay }: { name: string; size: string; delay: number }) {
  return (
    <div
      className="flex items-center gap-2.5 p-2.5 rounded-lg"
      style={{
        background: '#fff',
        border: `1px solid ${SAGE_SOFT}`,
        animation: `ffv-fade-up 0.5s ease-out ${delay}s both`,
      }}
    >
      {/* File icon */}
      <div
        style={{
          width: 32,
          height: 36,
          background: `linear-gradient(135deg, ${TERRACOTA}, #9a6e44)`,
          borderRadius: 4,
          position: 'relative',
          flexShrink: 0,
          color: '#fff',
          fontSize: 8,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 4,
        }}
        aria-hidden
      >
        PDF
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ color: SAGE_INK, letterSpacing: '-0.005em' }}
        >
          {name}
        </p>
        <p className="text-[10px]" style={{ color: TEXT_MUTED }}>
          {size} · enviado
        </p>
      </div>
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: SAGE_ACCENT,
          color: '#fff',
          fontSize: 11,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        ✓
      </span>
    </div>
  );
}

// ─── PLATAFORMA_STEPS — labels/descs do demo animado (usado pelo Hero) ───

const PLATAFORMA_STEPS = [
  {
    label: 'Trilha',
    desc: 'Módulos numerados, ordem pedagógica calibrada pelo seu objetivo.',
  },
  {
    label: 'Módulo',
    desc: 'Leitura + exemplo + quiz inline. Sem janela nova, sem fricção.',
  },
  {
    label: 'Quiz',
    desc: 'Feedback imediato com explicação. Alimenta a fila do SRS.',
  },
  {
    label: 'Progresso',
    desc: 'XP, streak, heatmap, ranking — ritmo que dura mais que motivação.',
  },
];

function PlatformDemoSection() {
  const [active, setActive] = useState(0);
  const [fillKey, setFillKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoAdvance = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % PLATAFORMA_STEPS.length);
      setFillKey(k => k + 1);
    }, 4000);
  };

  useEffect(() => {
    startAutoAdvance();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []); // startAutoAdvance é estável: só usa refs e setState sem deps externas

  const goTo = (i: number) => {
    setActive(i);
    setFillKey(k => k + 1);
    startAutoAdvance();
  };

  return (
    <>
      <BrowserDemo activeStep={active} />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:gap-3">
        {PLATAFORMA_STEPS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => goTo(i)}
            className="px-4 py-2.5 rounded-xl flex items-center gap-2.5"
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: active === i ? '#5e8068' : '#fff',
              color: active === i ? '#ffffff' : TEXT_MUTED,
              border: `1px solid ${active === i ? '#5e8068' : SAGE_SOFT}`,
              transform: active === i ? 'scale(1.05)' : 'scale(1)',
              minWidth: 140,
              cursor: 'pointer',
              transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease, transform 200ms ease',
            }}
          >
            {active === i && (
              <span
                key={fillKey}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: 3,
                  width: '100%',
                  background: 'rgba(255,255,255,0.22)',
                  transformOrigin: 'left',
                  animation: 'ffv-timer-fill 4s linear forwards',
                }}
              />
            )}
            <span
              className="font-mono text-[10px] font-bold"
              style={{ letterSpacing: '0.1em', opacity: 0.7, position: 'relative', zIndex: 1 }}
            >
              0{i + 1}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {s.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 mx-auto max-w-xl" style={{ position: 'relative', minHeight: 48 }}>
        {PLATAFORMA_STEPS.map((s, i) => (
          <p
            key={s.label}
            style={{
              position: 'absolute',
              inset: 0,
              fontSize: 14,
              color: SAGE_INK,
              lineHeight: 1.55,
              opacity: active === i ? 1 : 0,
              transform: active === i ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 300ms ease, transform 300ms ease',
              pointerEvents: active === i ? 'auto' : 'none',
            }}
          >
            <strong style={{ color: SAGE_ACCENT }}>{s.label}.</strong> {s.desc}
          </p>
        ))}
      </div>
    </>
  );
}

function BrowserDemo({ activeStep }: { activeStep: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#fff',
        border: `1px solid ${SAGE_SOFT}`,
        boxShadow: `
          0 24px 48px -16px rgba(31,58,48,0.18),
          0 8px 16px -8px rgba(31,58,48,0.10),
          0 1px 0 rgba(31,58,48,0.04)
        `,
        animation: 'ffv-fade-up 0.8s ease-out both',
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{
          background: '#f6f1e6',
          borderBottom: `1px solid ${SAGE_SOFT}`,
        }}
      >
        <div className="flex gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e57373' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffb74d' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#81c784' }} />
        </div>
        <div
          className="flex-1 mx-3 px-3 py-1 rounded text-[10px] flex items-center gap-1.5"
          style={{
            background: '#fff',
            border: `1px solid ${SAGE_SOFT}`,
            color: TEXT_MUTED,
            fontFamily: 'var(--font-inter)',
          }}
        >
          <span style={{ color: SAGE_ACCENT }}>🔒</span>
          ffvacademy.com/minha-trilha-personalizada
        </div>
      </div>

      {/* Slide stack — 4 telas absolute, cross-fading.
          Aspect ratio responsive: em mobile (viewport ~390px) o aspect 16:10
          dá só ~244px de altura, esmagando o conteúdo. Usamos:
            mobile: 4/5  → ~488px em 390vw (trilha visível, módulos legíveis)
            sm:     5/4  → ~512px em 640vw
            md+:    16/10 → original desktop, mais wide */}
      <div
        className="relative aspect-[4/5] sm:aspect-[5/4] md:aspect-[16/10] overflow-hidden"
        style={{ background: '#fafaf7' }}
      >
        <DemoSlideTrilha isActive={activeStep === 0} />
        <DemoSlideModulo isActive={activeStep === 1} />
        <DemoSlideQuiz isActive={activeStep === 2} />
        <DemoSlideProgresso isActive={activeStep === 3} />
      </div>
    </div>
  );
}

function DemoSlide({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 350ms ease, transform 350ms ease',
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
}

function DemoSlideTrilha({ isActive }: { isActive: boolean }) {
  const mods = [
    'Anatomia comparada',
    'Genética veterinária',
    'Reprodução animal',
    'Patologia clínica',
    'Farmacologia',
    'Microbiologia',
    'Imunologia',
    'Cirurgia I',
  ];
  return (
    <DemoSlide isActive={isActive}>
      <div className="h-full flex p-4 gap-3">
        {/* Sidebar */}
        <aside
          className="w-1/3 rounded-lg p-3"
          style={{ background: '#fff', border: `1px solid ${SAGE_SOFT}` }}
        >
          <p
            className="text-[9px] font-mono uppercase mb-2"
            style={{ color: SAGE_ACCENT, letterSpacing: '0.14em', fontWeight: 700 }}
          >
            Trilha Medvet
          </p>
          <ul className="flex flex-col gap-1 list-none p-0 m-0">
            {mods.slice(0, 6).map((m, i) => (
              <li
                key={m}
                className="text-[10px] px-2 py-1.5 rounded flex items-center gap-1.5"
                style={{
                  background: i === 1 ? `${SAGE_ACCENT}18` : 'transparent',
                  borderLeft: i === 1 ? `2px solid ${SAGE_ACCENT}` : '2px solid transparent',
                  color: i === 1 ? SAGE_INK : TEXT_MUTED,
                  fontWeight: i === 1 ? 600 : 400,
                  paddingLeft: 8,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: i < 1 ? SAGE_ACCENT : i === 1 ? `${SAGE_ACCENT}40` : '#ece6d8',
                    color: '#fff',
                    fontSize: 8,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {i < 1 ? '✓' : i + 1}
                </span>
                <span className="truncate">{m}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col gap-3">
          <div
            className="rounded-lg p-4"
            style={{
              background: `linear-gradient(135deg, ${SAGE_ACCENT}, #4a6b56)`,
              color: '#fff',
            }}
          >
            <p
              className="text-[9px] font-mono uppercase mb-2"
              style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.14em' }}
            >
              Próximo passo · 02 de 17
            </p>
            <h3
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.015em',
                marginBottom: 6,
              }}
            >
              Genética veterinária
            </h3>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
              Calibrada pelo edital do seu vestibular. 28 min · 4 questões · 1 caso clínico.
            </p>
            <div
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded"
              style={{ background: '#fff', color: SAGE_INK, fontWeight: 700 }}
            >
              Continuar →
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { l: 'Concluídos', v: '4', c: SAGE_ACCENT },
              { l: 'Em fila', v: '13', c: TERRACOTA },
              { l: 'XP ganho', v: '+820', c: SAGE_ACCENT },
            ].map(s => (
              <div
                key={s.l}
                className="rounded-md p-2.5"
                style={{ background: '#fff', border: `1px solid ${SAGE_SOFT}` }}
              >
                <p className="text-[8px] uppercase font-mono" style={{ color: TEXT_MUTED, letterSpacing: '0.1em' }}>
                  {s.l}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: s.c,
                    letterSpacing: '-0.02em',
                    marginTop: 2,
                  }}
                >
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </DemoSlide>
  );
}

function DemoSlideModulo({ isActive }: { isActive: boolean }) {
  return (
    <DemoSlide isActive={isActive}>
      <div className="h-full p-5 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-mono uppercase px-2 py-0.5 rounded"
            style={{
              background: `${SAGE_ACCENT}1a`,
              color: SAGE_ACCENT,
              letterSpacing: '0.12em',
              fontWeight: 700,
            }}
          >
            Módulo 03
          </span>
          <span className="text-[9px]" style={{ color: TEXT_MUTED }}>
            Reprodução animal · 32 min
          </span>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 18,
            fontWeight: 700,
            color: SAGE_INK,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Ciclo estral em cadelas — fases e hormônios
        </h3>
        <p className="text-[11px]" style={{ color: TEXT_MUTED, lineHeight: 1.55 }}>
          O ciclo estral canino é monoéstrico não-sazonal, dividido em 4 fases. Cada fase tem um perfil hormonal próprio — entender esse perfil é o que permite saber quando inseminar.
        </p>
        <div
          className="rounded-md p-3 text-[10px] font-mono"
          style={{
            background: SAGE_INK,
            color: '#dde6dd',
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: TERRACOTA }}>{'// Fases do ciclo'}</span>
          <br />
          <span style={{ color: '#fbbf24' }}>proestro</span>:{' '}
          <span style={{ color: '#a3e635' }}>9 dias</span> · ↑ estrógeno
          <br />
          <span style={{ color: '#fbbf24' }}>estro</span>:{' '}
          <span style={{ color: '#a3e635' }}>9 dias</span> · ↑ LH · ovulação
          <br />
          <span style={{ color: '#fbbf24' }}>diestro</span>:{' '}
          <span style={{ color: '#a3e635' }}>60 dias</span> · ↑ progesterona
          <br />
          <span style={{ color: '#fbbf24' }}>anestro</span>:{' '}
          <span style={{ color: '#a3e635' }}>~150 dias</span> · repouso
        </div>
        <div
          className="rounded-md p-3 flex items-start gap-2"
          style={{
            background: `${TERRACOTA}10`,
            border: `1px solid ${TERRACOTA}30`,
          }}
        >
          <span style={{ fontSize: 14 }}>💡</span>
          <p className="text-[10px]" style={{ color: SAGE_INK, lineHeight: 1.55 }}>
            <strong>Quiz inline:</strong> Em qual fase ocorre o pico de LH e ovulação?
          </p>
        </div>
      </div>
    </DemoSlide>
  );
}

function DemoSlideQuiz({ isActive }: { isActive: boolean }) {
  return (
    <DemoSlide isActive={isActive}>
      <div className="h-full p-6 flex flex-col gap-4 max-w-xl mx-auto">
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-mono uppercase"
            style={{ color: TERRACOTA, letterSpacing: '0.14em', fontWeight: 700 }}
          >
            Quiz · pergunta 3 de 4
          </span>
          <div className="flex gap-1">
            {[1, 1, 0, 0].map((s, i) => (
              <span
                key={i}
                style={{
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  background: s ? SAGE_ACCENT : SAGE_SOFT,
                }}
              />
            ))}
          </div>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 17,
            fontWeight: 700,
            color: SAGE_INK,
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          Em qual fase do ciclo estral canino ocorre o pico de LH e a ovulação?
        </h3>
        <div className="flex flex-col gap-2">
          {[
            { l: 'A', t: 'Proestro', correct: false },
            { l: 'B', t: 'Estro', correct: true },
            { l: 'C', t: 'Diestro', correct: false },
            { l: 'D', t: 'Anestro', correct: false },
          ].map(o => (
            <div
              key={o.l}
              className="px-3 py-2.5 rounded-md flex items-center gap-3 text-[11px]"
              style={{
                background: o.correct ? `${SAGE_ACCENT}14` : '#fff',
                border: o.correct
                  ? `2px solid ${SAGE_ACCENT}`
                  : `1px solid ${SAGE_SOFT}`,
                color: o.correct ? SAGE_INK : TEXT_MUTED,
                fontWeight: o.correct ? 600 : 400,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  background: o.correct ? SAGE_ACCENT : 'transparent',
                  border: o.correct ? 'none' : `1px solid ${SAGE_SOFT}`,
                  color: o.correct ? '#fff' : TEXT_MUTED,
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {o.l}
              </span>
              <span className="flex-1">{o.t}</span>
              {o.correct && (
                <span style={{ color: SAGE_ACCENT, fontWeight: 700, fontSize: 14 }}>✓</span>
              )}
            </div>
          ))}
        </div>
        <div
          className="rounded-md p-3 flex items-center gap-2"
          style={{
            background: `linear-gradient(90deg, ${SAGE_ACCENT}1a, ${SAGE_ACCENT}06)`,
            border: `1px solid ${SAGE_ACCENT}40`,
          }}
        >
          <span style={{ fontSize: 16 }}>🎯</span>
          <p className="text-[10px]" style={{ color: SAGE_INK, lineHeight: 1.5 }}>
            <strong>Correto!</strong> +25 XP · próxima revisão em 4 dias (SRS).
          </p>
        </div>
      </div>
    </DemoSlide>
  );
}

function DemoSlideProgresso({ isActive }: { isActive: boolean }) {
  return (
    <DemoSlide isActive={isActive}>
      <div className="h-full p-5 grid grid-cols-2 gap-3">
        {/* XP / Streak / Level */}
        <div
          className="rounded-lg p-4 flex flex-col justify-between"
          style={{
            background: `linear-gradient(135deg, ${SAGE_ACCENT}, #4a6b56)`,
            color: '#fff',
          }}
        >
          <p
            className="text-[9px] font-mono uppercase"
            style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.14em' }}
          >
            Seu progresso
          </p>
          <div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
              1.240
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
              XP · nível 4 · 78% pra nível 5
            </p>
          </div>
          <div className="flex gap-2 text-[10px]">
            <span
              className="px-2 py-1 rounded"
              style={{ background: 'rgba(255,255,255,0.18)', fontWeight: 600 }}
            >
              🔥 12 dias
            </span>
            <span
              className="px-2 py-1 rounded"
              style={{ background: 'rgba(255,255,255,0.18)', fontWeight: 600 }}
            >
              ⭐ 8 badges
            </span>
          </div>
        </div>

        {/* Heatmap */}
        <div
          className="rounded-lg p-3"
          style={{ background: '#fff', border: `1px solid ${SAGE_SOFT}` }}
        >
          <p
            className="text-[9px] font-mono uppercase mb-2"
            style={{ color: TEXT_MUTED, letterSpacing: '0.12em', fontWeight: 700 }}
          >
            Heatmap · 12 semanas
          </p>
          <div
            className="grid gap-[2px]"
            style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
          >
            {Array.from({ length: 84 }).map((_, i) => {
              const intensity = [0, 0, 1, 2, 3, 2, 4, 3, 4, 3, 2, 4][i % 12] / 4;
              return (
                <span
                  key={i}
                  style={{
                    aspectRatio: 1,
                    borderRadius: 2,
                    background:
                      intensity === 0
                        ? '#ece6d8'
                        : `rgba(94, 128, 104, ${0.2 + intensity * 0.8})`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Ranking */}
        <div
          className="col-span-2 rounded-lg p-3"
          style={{ background: '#fff', border: `1px solid ${SAGE_SOFT}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[9px] font-mono uppercase"
              style={{ color: TERRACOTA, letterSpacing: '0.14em', fontWeight: 700 }}
            >
              Ranking semanal · Medvet
            </p>
            <span className="text-[9px]" style={{ color: TEXT_MUTED, fontFamily: 'var(--font-inter)' }}>
              top 50
            </span>
          </div>
          <ul className="flex flex-col gap-1 list-none p-0 m-0">
            {[
              { p: '01', n: 'Mariana V.', xp: '4.820', me: false },
              { p: '02', n: 'Você', xp: '4.310', me: true },
              { p: '03', n: 'Bruno P.', xp: '3.940', me: false },
              { p: '04', n: 'Larissa S.', xp: '3.620', me: false },
            ].map(r => (
              <li
                key={r.p}
                className="flex items-center gap-3 px-2 py-1.5 rounded text-[10px]"
                style={{
                  background: r.me ? `${SAGE_ACCENT}14` : 'transparent',
                  border: r.me ? `1px solid ${SAGE_ACCENT}40` : '1px solid transparent',
                  fontWeight: r.me ? 700 : 500,
                  color: r.me ? SAGE_INK : TEXT_MUTED,
                }}
              >
                <span
                  className="font-mono"
                  style={{ color: r.me ? SAGE_ACCENT : TEXT_MUTED, fontWeight: 700, width: 18 }}
                >
                  {r.p}
                </span>
                <span className="flex-1">{r.n}</span>
                <span style={{ color: r.me ? SAGE_ACCENT : TEXT_MUTED, fontWeight: 700 }}>
                  {r.xp} XP
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DemoSlide>
  );
}

// ─── 1.5 AntesDepois — storytelling visual da transformação ───────────────
// Conversão padrão Maven/Headspace: mostra o "estado caótico ANTES" vs
// "estado calmo DEPOIS". Cria identificação imediata com o aluno.

function AntesDepois() {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{
        ...SECTION,
        background: PAPER,
        borderTop: `1px solid ${SAGE_SOFT}`,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p style={{ ...KICKER, color: TERRACOTA, fontWeight: 700 }}>
            A transformação
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-inter, system-ui), sans-serif',
              fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginTop: 16,
              marginBottom: 14,
              color: SAGE_INK,
            }}
          >
            De PDFs soltos a uma{' '}
            <span style={{ color: SAGE_ACCENT, fontStyle: 'italic', fontWeight: 600 }}>
              escola estruturada
            </span>
            .
          </h2>
          <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.6 }}>
            Você manda o caos. A FFV devolve o método. Em 24h.
          </p>
        </div>

        <div
          className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          data-reveal
          data-reveal-stagger
          ref={useReveal<HTMLDivElement>()}
        >
          {/* ANTES — tilt 3D suave (4°) + stagger entrance */}
          <TiltCard
            as="article"
            maxTilt={4}
            scale={1.01}
            className="p-7 lg:p-8 rounded-2xl ffv-stagger-item"
            style={{
              background: '#ffffff',
              border: `1px solid ${SAGE_SOFT}`,
              boxShadow: '0 1px 2px rgba(31,58,48,0.04)',
            }}
          >
            <p
              className="text-[11px] font-mono uppercase mb-4"
              style={{
                color: '#9a6e44',
                letterSpacing: '0.16em',
                fontWeight: 700,
              }}
            >
              😩 Antes da FFV
            </p>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {[
                'Material da faculdade espalhado em 12 pastas diferentes',
                'Slides do cursinho com 400 lâminas sem ordem',
                'Anotações no caderno, no Notion, no Notes do iPhone',
                'Você tenta ChatGPT — recebe parágrafos soltos',
                'Sem trilha. Sem revisão. Sem prática.',
              ].map(t => (
                <li
                  key={t}
                  className="text-sm flex items-start gap-2.5"
                  style={{ color: TEXT_MUTED, lineHeight: 1.55 }}
                >
                  <span aria-hidden style={{ color: TERRACOTA, marginTop: 1 }}>×</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </TiltCard>

          {/* DEPOIS — entra 80ms depois do ANTES + tilt 3D no hover (WOW factor).
              Em mobile/touch o tilt vira no-op automaticamente. */}
          <TiltCard
            as="article"
            maxTilt={5}
            scale={1.015}
            className="p-7 lg:p-8 rounded-2xl ffv-stagger-item"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f8f4ea 100%)',
              border: `2px solid ${SAGE_ACCENT}40`,
              boxShadow: `0 8px 24px -8px ${SAGE_ACCENT}30, 0 1px 2px rgba(31,58,48,0.04)`,
            }}
          >
            <p
              className="text-[11px] font-mono uppercase mb-4"
              style={{
                color: SAGE_ACCENT,
                letterSpacing: '0.16em',
                fontWeight: 700,
              }}
            >
              ✨ Depois da FFV (no mesmo dia)
            </p>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {[
                'Trilha com 12-17 módulos numerados, ordem pedagógica',
                'Cada módulo: leitura + exemplo + quiz com explicação',
                'SRS científico calibrado pelo SEU material — revisa no tempo certo',
                'XP, badges, streak — ritmo, não força de vontade',
                'Revisão humana valida toda trilha antes de entregar',
              ].map(t => (
                <li
                  key={t}
                  className="text-sm flex items-start gap-2.5"
                  style={{ color: SAGE_INK, lineHeight: 1.55 }}
                >
                  <span aria-hidden style={{ color: SAGE_ACCENT, marginTop: 1, fontWeight: 700 }}>
                    ✓
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </TiltCard>
        </div>
      </div>
    </section>
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

        {/* 3 punchlines diretas nomeando cada concorrente — desarmam dúvida na hora.
            Stagger reveal: cards entram em cascata (80ms cada) quando a section
            entra na viewport — aprofunda a percepção de "vivo" sem distrair. */}
        <div className="grid md:grid-cols-3 gap-5 mt-10" data-reveal data-reveal-stagger ref={useReveal<HTMLDivElement>()}>
          {[
            { rival: 'NotebookLM', eles: 'te dá um resumo do PDF.', nos: 'te dá uma escola.' },
            { rival: 'ChatGPT', eles: 'te responde uma vez.', nos: 'te treina toda semana.' },
            { rival: 'Anki', eles: 'te memoriza um card.', nos: 'te ensina antes.' },
          ].map(p => (
            // Spotlight — uma luz radial âmbar acompanha o cursor nesses cards.
            // Visualmente impactante mas ZERO ruído sem hover.
            <Spotlight
              key={p.rival}
              as="article"
              color="var(--ffv-amber, #fbbf24)"
              className="p-5 rounded-xl ffv-stagger-item ffv-hover-lift"
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
            </Spotlight>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. Bento Grid v7 — light editorial sage warm ──────────────────────────

function PadraoFFV() {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      data-reveal
      className="px-6 lg:px-10"
      style={{
        ...SECTION,
        background: '#f6f1e6', // cream levemente mais escuro pra contraste
        color: SAGE_INK,
        position: 'relative',
        overflow: 'hidden',
        borderTop: `1px solid ${SAGE_SOFT}`,
      }}
    >
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p
            style={{
              ...KICKER,
              color: SAGE_ACCENT,
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
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: 16,
              marginBottom: 16,
              color: SAGE_INK,
            }}
          >
            Toda jornada nasce com os{' '}
            <span style={{ color: SAGE_ACCENT, fontStyle: 'italic', fontWeight: 600 }}>
              mesmos 6 pilares
            </span>
            .
          </h2>
          <p
            style={{
              fontSize: 16,
              color: TEXT_MUTED,
              lineHeight: 1.6,
            }}
          >
            Direito, design, medicina, marketing — o conteúdo muda, o padrão não.
          </p>
        </div>

        {/* Bento Grid: 4 colunas em desktop, asymmetric.
            Stagger cinema: cards aparecem 1 por vez (220ms entre cada),
            com fade + slide-up + scale 0.92→1 + spring easing.
            Total ~1.3s pro 6º card aparecer — efeito wow, intencional. */}
        <div
          className="grid gap-4"
          data-reveal
          data-reveal-stagger-cinema
          ref={useReveal<HTMLDivElement>()}
          style={{
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            gridAutoRows: 'minmax(200px, auto)',
          }}
        >
          {/* Card 1: Trilhas ordenadas — span 7 cols */}
          <BentoCard
            className="ffv-cinema-item"
            span="md:col-span-7"
            accent={SAGE_ACCENT}
            title="Trilhas ordenadas"
            subtitle="Do básico ao avançado. Cada módulo constrói no anterior — sem buracos pedagógicos."
            visual={
              <div className="mt-5 flex flex-col gap-1.5">
                {[
                  { n: 1, t: 'Fundamentos · célula e tecidos', d: '18 min', s: 'done' },
                  { n: 2, t: 'Genética veterinária básica', d: '24 min', s: 'done' },
                  { n: 3, t: 'Reprodução · ciclo estral', d: '32 min', s: 'active' },
                  { n: 4, t: 'Patologia clínica aplicada', d: '28 min', s: 'next' },
                  { n: 5, t: 'Farmacologia veterinária', d: '36 min', s: 'next' },
                ].map(m => (
                  <div
                    key={m.n}
                    className="flex items-center gap-3 px-3 py-2 rounded-md"
                    style={{
                      background: m.s === 'active' ? `${SAGE_ACCENT}14` : '#fcf9f1',
                      border: `1px solid ${m.s === 'active' ? `${SAGE_ACCENT}50` : SAGE_SOFT}`,
                      borderLeft:
                        m.s === 'active'
                          ? `3px solid ${SAGE_ACCENT}`
                          : `1px solid ${SAGE_SOFT}`,
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 5,
                        background:
                          m.s === 'done'
                            ? SAGE_ACCENT
                            : m.s === 'active'
                              ? `${SAGE_ACCENT}30`
                              : '#ece6d8',
                        color: m.s === 'done' ? '#fff' : SAGE_INK,
                        fontSize: 10,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontFamily: 'var(--font-inter)',
                      }}
                      aria-hidden
                    >
                      {m.s === 'done' ? '✓' : m.n}
                    </span>
                    <span
                      className="text-[12px] flex-1 truncate"
                      style={{
                        color: m.s === 'next' ? TEXT_MUTED : SAGE_INK,
                        fontWeight: m.s === 'active' ? 600 : 500,
                      }}
                    >
                      {m.t}
                    </span>
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: TEXT_MUTED, letterSpacing: '0.04em' }}
                    >
                      {m.d}
                    </span>
                  </div>
                ))}
              </div>
            }
          />

          {/* Card 2: Revisão espaçada (SRS) — span 5 cols */}
          <BentoCard
            className="ffv-cinema-item"
            span="md:col-span-5"
            accent={SAGE_ACCENT}
            title="Revisão espaçada"
            subtitle="SRS calibrado pelo SEU material. Traz de volta no tempo certo, com base no que você errou."
            visual={
              <div className="mt-5">
                {/* Próximas revisões */}
                <p
                  className="text-[10px] font-mono uppercase mb-2"
                  style={{ color: TEXT_MUTED, letterSpacing: '0.12em', fontWeight: 700 }}
                >
                  Próximas 7 sessões
                </p>
                <div className="flex items-end gap-1 h-20 mb-3">
                  {[
                    { h: 60, l: 'Seg', n: 8 },
                    { h: 85, l: 'Ter', n: 11, today: true },
                    { h: 40, l: 'Qua', n: 5 },
                    { h: 70, l: 'Qui', n: 9 },
                    { h: 95, l: 'Sex', n: 13 },
                    { h: 50, l: 'Sáb', n: 6 },
                    { h: 30, l: 'Dom', n: 4 },
                  ].map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        style={{
                          width: '100%',
                          height: `${d.h}%`,
                          background: d.today
                            ? `linear-gradient(180deg, ${TERRACOTA}, ${TERRACOTA}99)`
                            : `linear-gradient(180deg, ${SAGE_ACCENT}, ${SAGE_ACCENT}66)`,
                          borderRadius: '3px 3px 1px 1px',
                          position: 'relative',
                        }}
                      >
                        <span
                          className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono"
                          style={{ color: d.today ? TERRACOTA : SAGE_INK, fontWeight: 700 }}
                        >
                          {d.n}
                        </span>
                      </div>
                      <span
                        className="text-[9px] font-mono"
                        style={{
                          color: d.today ? TERRACOTA : TEXT_MUTED,
                          fontWeight: d.today ? 700 : 500,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {d.l}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="px-3 py-2 rounded-md flex items-center gap-2 text-[11px]"
                  style={{
                    background: `${TERRACOTA}10`,
                    border: `1px solid ${TERRACOTA}30`,
                  }}
                >
                  <span aria-hidden>🧠</span>
                  <span style={{ color: SAGE_INK, fontWeight: 500 }}>
                    <strong>11 cards hoje</strong> · próximo em 8 min
                  </span>
                </div>
              </div>
            }
          />

          {/* Card 3: Exercícios integrados — span 4 cols */}
          <BentoCard
            className="ffv-cinema-item"
            span="md:col-span-4"
            accent={TERRACOTA}
            title="Exercícios integrados"
            subtitle="Você testa o aprendizado na hora. Feedback imediato com explicação."
            visual={
              <div className="mt-5 flex flex-col gap-2">
                {[
                  { l: 'Q1', t: 'Fase de pico do LH?', s: 'right', xp: '+10' },
                  { l: 'Q2', t: 'Duração média do estro?', s: 'right', xp: '+10' },
                  { l: 'Q3', t: 'Hormônio do diestro?', s: 'wrong', xp: 'revisar' },
                  { l: 'Q4', t: 'Inseminação ideal em…', s: 'pending', xp: '—' },
                ].map(q => {
                  const colorMap = { right: SAGE_ACCENT, wrong: TERRACOTA, pending: TEXT_MUTED };
                  const c = colorMap[q.s as keyof typeof colorMap];
                  return (
                    <div
                      key={q.l}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px]"
                      style={{
                        background: q.s === 'pending' ? '#fcf9f1' : `${c}10`,
                        border: `1px solid ${q.s === 'pending' ? SAGE_SOFT : `${c}40`}`,
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: q.s === 'right' ? c : 'transparent',
                          border: q.s === 'right' ? 'none' : `1.5px solid ${c}`,
                          color: q.s === 'right' ? '#fff' : c,
                          fontSize: 10,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        aria-hidden
                      >
                        {q.s === 'right' ? '✓' : q.s === 'wrong' ? '×' : '○'}
                      </span>
                      <span
                        className="font-mono"
                        style={{ color: SAGE_INK, fontWeight: 600, fontSize: 10 }}
                      >
                        {q.l}
                      </span>
                      <span className="flex-1 truncate" style={{ color: TEXT_MUTED }}>
                        {q.t}
                      </span>
                      <span
                        className="text-[9px] font-mono"
                        style={{ color: c, fontWeight: 700, letterSpacing: '0.04em' }}
                      >
                        {q.xp}
                      </span>
                    </div>
                  );
                })}
              </div>
            }
          />

          {/* Card 4: Gamificação — span 5 cols */}
          <BentoCard
            className="ffv-cinema-item"
            span="md:col-span-5"
            accent={SAGE_ACCENT}
            title="Gamificação inteligente"
            subtitle="XP, badges e streak. Ritmo > força de vontade."
            visual={
              <div className="mt-5">
                {/* XP bar */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[10px] font-mono uppercase"
                    style={{ color: SAGE_ACCENT, letterSpacing: '0.12em', fontWeight: 700 }}
                  >
                    Nível 4 → 5
                  </span>
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: TEXT_MUTED, fontWeight: 600 }}
                  >
                    1.240 / 1.600 XP
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden mb-4"
                  style={{ background: '#ece6d8' }}
                >
                  <div
                    style={{
                      width: '78%',
                      height: '100%',
                      background: `linear-gradient(90deg, ${SAGE_ACCENT}, #4a6b56)`,
                      borderRadius: 999,
                    }}
                  />
                </div>
                {/* Stats em grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { i: '🔥', v: '14', l: 'dias streak', c: TERRACOTA },
                    { i: '⭐', v: '7', l: 'badges raros', c: SAGE_ACCENT },
                    { i: '🏆', v: '#23', l: 'no ranking', c: SAGE_ACCENT },
                  ].map(b => (
                    <div
                      key={b.l}
                      className="px-2.5 py-2 rounded-md text-center"
                      style={{
                        background: '#fcf9f1',
                        border: `1px solid ${SAGE_SOFT}`,
                      }}
                    >
                      <div style={{ fontSize: 16, marginBottom: 2 }}>{b.i}</div>
                      <p
                        style={{
                          fontFamily: 'var(--font-inter)',
                          fontSize: 15,
                          fontWeight: 800,
                          color: b.c,
                          letterSpacing: '-0.02em',
                          lineHeight: 1,
                        }}
                      >
                        {b.v}
                      </p>
                      <p
                        className="text-[9px] font-mono uppercase mt-0.5"
                        style={{ color: TEXT_MUTED, letterSpacing: '0.08em' }}
                      >
                        {b.l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            }
          />

          {/* Card 5: Curadoria humana — span 3 cols */}
          <BentoCard
            className="ffv-cinema-item"
            span="md:col-span-3"
            accent={TERRACOTA}
            title="Curadoria humana"
            subtitle="Toda trilha passa pelo crivo de um engenheiro antes de ir ao ar."
            visual={
              <div className="mt-5 flex flex-col gap-2">
                <div
                  className="flex items-center gap-2 p-2 rounded-md"
                  style={{
                    background: `${SAGE_ACCENT}10`,
                    border: `1px solid ${SAGE_ACCENT}30`,
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${TERRACOTA}, #9a6e44)`,
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'var(--font-inter)',
                    }}
                    aria-hidden
                  >
                    FFV
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px]" style={{ color: SAGE_INK, fontWeight: 700 }}>
                      Fernando F. V.
                    </p>
                    <p className="text-[9px]" style={{ color: TEXT_MUTED }}>
                      Revisou · há 2h
                    </p>
                  </div>
                  <span style={{ color: SAGE_ACCENT, fontSize: 12, fontWeight: 700 }}>✓</span>
                </div>
                <p className="text-[10px]" style={{ color: TEXT_MUTED, lineHeight: 1.5 }}>
                  <strong style={{ color: SAGE_INK }}>0%</strong> das trilhas vão ao ar sem revisão humana.
                </p>
              </div>
            }
          />

          {/* Card 6: PT-BR mobile-first — span 9 cols (full) */}
          <BentoCard
            className="ffv-cinema-item"
            span="md:col-span-9"
            accent={TERRACOTA}
            title="PT-BR nativo · qualquer dispositivo · zero cadastro pra começar"
            subtitle="Sem trial, sem cartão, sem app pra baixar. Funciona como PWA — instala no celular como app nativo se quiser."
            visual={
              <div
                className="mt-4 flex gap-2 text-[11px] flex-wrap"
                style={{ color: TEXT_MUTED }}
              >
                {['🇧🇷 PT-BR nativo', '📱 PWA instalável', '⚡ Offline-first', '🔓 Sem cadastro'].map(
                  t => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-md"
                      style={{
                        background: '#fcf9f1',
                        border: `1px solid ${SAGE_SOFT}`,
                        color: SAGE_INK,
                        fontWeight: 500,
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
  /** Permite o pai aplicar classes extras (ex.: ffv-stagger-cinema-item). */
  className?: string;
}

function BentoCard({ span, accent, title, subtitle, visual, className }: BentoCardProps) {
  return (
    <article
      className={`col-span-12 ${span} p-6 lg:p-7 transition-all ${className ?? ''}`}
      style={{
        background: '#ffffff',
        border: `1px solid ${SAGE_SOFT}`,
        borderRadius: 14,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(31,58,48,0.04)',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = `${accent}88`;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 24px -6px ${accent}30`;
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = SAGE_SOFT;
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(31,58,48,0.04)';
      }}
    >
      {/* Accent gradient corner — sutil */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 130,
          height: 130,
          background: `radial-gradient(circle, ${accent}22, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />
      <h3
        style={{
          fontFamily: 'var(--font-inter, system-ui), sans-serif',
          fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)',
          fontWeight: 700,
          color: SAGE_INK,
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
          color: TEXT_MUTED,
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
  // Section ganha stagger automático — cards "Em 3 passos" entram em cascata
  // (80ms cada) quando a section entra na viewport. Sub-300ms de delay total.
  const ref = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      data-reveal
      data-reveal-stagger
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
            { n: '3', t: 'Recebe no mesmo dia',       d: 'IA + curadoria entregam a jornada. Você começa a estudar.' },
          ].map(s => (
            <div key={s.n} className="ffv-stagger-item">
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

          {/* Stats com stagger cinema — 3 números entram em sequência. */}
          <div
            ref={useReveal<HTMLDivElement>()}
            data-reveal
            data-reveal-stagger-cinema
            className="grid grid-cols-3 gap-6 mb-8"
          >
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
    <div className="ffv-cinema-item">
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
    a: 'ChatGPT te responde; ele esquece amanhã. NotebookLM te dá um resumo do PDF em 30 segundos. Anki tem SRS sofisticado (hoje FSRS-6), mas exige que você crie cada card sozinho. A FFV junta tudo num sistema: trilha sequencial → quiz → SRS calibrado pelo seu próprio material → certificado. Você entende, testa e revisa no tempo certo — não monta nada.',
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
    a: 'A V1 já tem tecnologia (157 módulos) e medicina veterinária (16 módulos: Genética + Métodos de Seleção, com simulado) prontas. Outras áreas — medicina humana, direito, design, concurso, pós — abrem por demanda: você manda o pedido, a gente avalia e monta. Maio/2026 já tem fila ativa de medicina e OAB.',
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

        {/* Stagger reveal nas 8 perguntas — entram com 80ms de cascata,
            menos dramático que cinema porque são muitas (8). */}
        <div
          ref={useReveal<HTMLDivElement>()}
          data-reveal
          data-reveal-stagger
          style={{ borderTop: '1px solid var(--ffv-border)' }}
        >
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
    <div className="ffv-stagger-item" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
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
      {/* Resposta com slide-down animado em vez de aparecer instantâneo.
          Wrapper grid + grid-template-rows é o truque pra animar height. */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 320ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <p
            className="text-sm pb-6 pr-10"
            style={{
              color: '#57534e',
              lineHeight: 1.65,
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0)' : 'translateY(-4px)',
              transition: 'opacity 280ms ease 80ms, transform 280ms ease 80ms',
            }}
          >
            {a}
          </p>
        </div>
      </div>
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
            Leva 2 minutos. Você descreve, envia os materiais, e no mesmo dia sua jornada está no ar.
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
