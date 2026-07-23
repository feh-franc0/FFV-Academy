'use client';

/**
 * SobreClient — versão animada da página /sobre.
 *
 * Decisão (2026-05-21): /sobre estava completamente flat (server component
 * sem animação). Replicamos o pattern da LandingClient com motion premium:
 *   - Hero: aurora + noise + particles + word-by-word reveal + highlight
 *   - "O que construímos": stagger nos parágrafos
 *   - Princípios: stagger cinema + tilt 3D nos 4 cards
 *   - CTA final: shimmer no botão + glow + magnetic
 *
 * page.tsx continua server pra preservar metadata SEO + structured data.
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { TiltCard } from '@/components/ui/motion';

const SERIF = 'var(--font-serif), Georgia, serif';
const SANS = 'var(--font-inter), system-ui, sans-serif';

// ─── Hook util: scroll-triggered reveal (mesmo pattern da Landing) ──────
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
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function SobreClient() {
  const heroRef = useReveal<HTMLHeadingElement>();
  const principlesRef = useReveal<HTMLDivElement>();
  const construindoRef = useReveal<HTMLDivElement>();
  const ctaRef = useReveal<HTMLHeadingElement>();

  return (
    <div style={{ background: 'var(--ffv-paper)', color: 'var(--ffv-ink)' }}>
      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section
        className="px-6 lg:px-10 relative overflow-hidden ffv-aurora ffv-noise"
        style={{
          paddingTop: 'clamp(120px, 14vw, 168px)',
          paddingBottom: 'clamp(48px, 6vw, 80px)',
        }}
      >
        {/* Partículas pairando — 6 pontos coloridos no fundo */}
        <div className="ffv-particles" aria-hidden />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 80% 0%, color-mix(in srgb, var(--ffv-amber) 10%, transparent) 0%, transparent 65%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          {/* Kicker com pulse-dot ao invés de line */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className="ffv-pulse-dot"
              style={{ background: 'var(--ffv-amber)', width: 8, height: 8 }}
              aria-hidden
            />
            <span
              style={{
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ffv-amber)',
              }}
            >
              Sobre a plataforma
            </span>
          </div>

          {/* Headline com word-by-word reveal + highlight sweep na palavra-chave */}
          <h1
            ref={heroRef}
            data-reveal
            data-reveal-words
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 'clamp(2.2rem, 4.8vw, 4rem)',
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
              marginBottom: 26,
              color: 'var(--ffv-ink)',
            }}
          >
            <span className="ffv-word-reveal">Estudar</span>{' '}
            <span className="ffv-word-reveal">bem</span>{' '}
            <span className="ffv-word-reveal">não</span>{' '}
            <span className="ffv-word-reveal">deveria</span>{' '}
            <span className="ffv-word-reveal">depender</span>{' '}
            <span className="ffv-word-reveal">de</span>{' '}
            <span
              className="ffv-word-reveal ffv-highlight"
              style={{
                fontStyle: 'italic',
                color: 'var(--ffv-amber)',
                fontWeight: 700,
              }}
            >
              materiais soltos e bagunçados.
            </span>
          </h1>

          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(1.05rem, 1.25vw, 1.2rem)',
              color: '#44403c',
              lineHeight: 1.65,
              maxWidth: 720,
            }}
          >
            A FFV Academy nasceu pra resolver um problema que todo estudante conhece: o conteúdo
            existe, mas a{' '}
            <strong style={{ color: 'var(--ffv-ink)', fontWeight: 600 }}>
              experiência de aprender
            </strong>{' '}
            não. Faculdade, cursinho, curso livre, concurso — em todos eles você acaba com PDFs,
            slides, vídeos e anotações sem ordem nenhuma.
          </p>
        </div>
      </section>

      {/* ─── O que construímos — parágrafos com stagger reveal ─────────── */}
      <section
        className="px-6 lg:px-10"
        style={{
          paddingTop: 'clamp(64px, 8vw, 96px)',
          paddingBottom: 'clamp(64px, 8vw, 96px)',
          borderTop: '1px solid var(--ffv-border)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: 24,
              color: 'var(--ffv-ink)',
            }}
          >
            O que estamos construindo
          </h2>
          {/* Stagger cinema nos 3 parágrafos — narrativa que aparece em ritmo */}
          <div
            ref={construindoRef}
            data-reveal
            data-reveal-stagger-cinema
            style={{
              fontFamily: SANS,
              fontSize: '1.05rem',
              color: '#44403c',
              lineHeight: 1.75,
            }}
            className="space-y-5"
          >
            <p className="ffv-cinema-item">
              Uma plataforma de educação personalizada pra{' '}
              <em style={{ fontFamily: SERIF, fontStyle: 'italic', color: 'var(--ffv-ink)' }}>
                qualquer
              </em>{' '}
              área de estudo. Você conta o que está estudando — uma matéria da faculdade, um
              capítulo de cálculo, uma prova de constitucional, um conteúdo de AWS, um edital de
              concurso — e entregamos uma jornada de aprendizado feita sob medida.
            </p>
            <p className="ffv-cinema-item">
              Não é um chatbot. Não é um gerador de texto. É uma trilha com módulos sequenciais,
              exercícios, exemplos práticos e revisão espaçada, montada a partir do{' '}
              <strong style={{ color: 'var(--ffv-ink)', fontWeight: 600 }}>seu objetivo</strong>{' '}
              e dos seus materiais.
            </p>
            <p className="ffv-cinema-item">
              Funciona pra estudantes de medicina, veterinária, engenharia, direito, design,
              administração, saúde, tecnologia, concursos — qualquer área. Em PT-BR, gratuito
              enquanto crescemos, sem paywall de conteúdo.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Princípios — 4 cards com tilt 3D + stagger cinema ──────────── */}
      <section
        className="px-6 lg:px-10"
        style={{
          paddingTop: 'clamp(64px, 8vw, 96px)',
          paddingBottom: 'clamp(64px, 8vw, 96px)',
          borderTop: '1px solid var(--ffv-border)',
          background: '#fdfbf6',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <span
            style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ffv-amber)',
              display: 'block',
              marginBottom: 14,
            }}
          >
            Os princípios
          </span>
          <h2
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: 36,
              color: 'var(--ffv-ink)',
            }}
          >
            O que guia cada decisão de produto.
          </h2>

          {/* Stagger cinema: cards aparecem 1 por vez (220ms cada),
              com scale + slide + spring. */}
          <div
            ref={principlesRef}
            data-reveal
            data-reveal-stagger-cinema
            className="grid sm:grid-cols-2 gap-5"
          >
            <Principle
              num="01"
              title="Profundidade real, não cobertura"
              desc="Preferimos ensinar um tópico por dentro do que tocar dez por fora. Cada módulo é uma imersão que você sai sabendo aplicar — não decorando."
            />
            <Principle
              num="02"
              title="Jornada organizada, não texto solto"
              desc="Módulos sequenciais, exercícios pra testar entendimento, revisão espaçada pra memorização real. Não é só conteúdo: é um caminho do começo ao fim."
            />
            <Principle
              num="03"
              title="Personalização do seu material"
              desc="Você envia PDFs, slides, apostilas, anotações. Partimos do conteúdo da sua faculdade ou curso — não de um currículo genérico."
            />
            <Principle
              num="04"
              title="Sem paywall de conteúdo"
              desc="Aprender é direito. Cobramos eventualmente por simulados ou serviços premium, mas o conhecimento em si é gratuito."
            />
          </div>
        </div>
      </section>

      {/* ─── CTA final — shimmer no botão + glow background ─────────────── */}
      <section
        className="px-6 lg:px-10 relative overflow-hidden ffv-aurora"
        style={{
          paddingTop: 'clamp(72px, 10vw, 120px)',
          paddingBottom: 'clamp(72px, 10vw, 120px)',
          borderTop: '1px solid var(--ffv-border)',
        }}
      >
        <div className="ffv-particles" aria-hidden />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 100%, color-mix(in srgb, var(--ffv-amber) 14%, transparent) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2
            ref={ctaRef}
            data-reveal
            data-reveal-words
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)',
              letterSpacing: '-0.022em',
              lineHeight: 1.1,
              marginBottom: 18,
              color: 'var(--ffv-ink)',
            }}
          >
            <span className="ffv-word-reveal">Pronto</span>{' '}
            <span className="ffv-word-reveal">pra</span>{' '}
            <span className="ffv-word-reveal">estudar</span>{' '}
            <span className="ffv-word-reveal">com</span>{' '}
            <span
              className="ffv-word-reveal ffv-highlight"
              style={{ fontStyle: 'italic', color: 'var(--ffv-amber)' }}
            >
              uma jornada feita pra você?
            </span>
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: '1.05rem',
              color: '#44403c',
              maxWidth: 520,
              margin: '0 auto 32px',
              lineHeight: 1.65,
            }}
          >
            Conte o que precisa estudar. Em até 24 horas devolvemos uma jornada completa — com
            trilhas, conteúdo, exercícios e revisão — feita pro seu objetivo.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/#solicitar-base"
              // Shimmer sweep no CTA principal — luz diagonal a cada 4s
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-semibold transition-all ffv-shimmer"
              style={{
                fontFamily: SANS,
                background: 'var(--ffv-ink)',
                color: '#fff',
                borderRadius: 10,
                letterSpacing: '-0.005em',
                boxShadow: '0 10px 28px -8px rgba(28,25,23,0.4)',
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>
                Criar minha jornada
                <span aria-hidden style={{ fontSize: 12, marginLeft: 8 }}>→</span>
              </span>
            </Link>
            <Link
              href="/bases"
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-semibold transition-colors ffv-hover-lift"
              style={{
                fontFamily: SANS,
                background: 'transparent',
                border: '1px solid var(--ffv-ink)',
                color: 'var(--ffv-ink)',
                borderRadius: 10,
              }}
            >
              Ver as bases existentes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Principle card com tilt 3D ───────────────────────────────────────
//
// Movido pra TiltCard pra ganhar rotação 3D suave no hover (mesma do
// "Antes/Depois" da landing). Mobile/touch: degrada pra static.
function Principle({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <TiltCard
      as="article"
      maxTilt={4}
      scale={1.015}
      className="p-7 ffv-cinema-item"
      style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid var(--ffv-border)',
        boxShadow: 'var(--ffv-shadow-soft)',
      }}
    >
      <p
        style={{
          fontFamily: SERIF,
          fontSize: 14,
          fontStyle: 'italic',
          color: 'var(--ffv-amber)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: 12,
        }}
      >
        {num}
      </p>
      <h3
        style={{
          fontFamily: SANS,
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          marginBottom: 8,
          color: 'var(--ffv-ink)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: SANS,
          fontSize: 14,
          color: '#57534e',
          lineHeight: 1.65,
        }}
      >
        {desc}
      </p>
    </TiltCard>
  );
}
