'use client';

import Link from 'next/link';
import { CURRICULUM } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

const trail1 = CURRICULUM[0];
const trail2 = CURRICULUM[1];
const trail3 = CURRICULUM[2];

export function HomeClient() {
  const { state } = useGameState();
  const totalArticles = CURRICULUM.reduce((a, t) => a + t.modules.length, 0);

  return (
    <div style={{ background: 'var(--ffv-bg)' }}>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">

        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(88,166,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88,166,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(88,166,255,0.13) 0%, transparent 65%)',
        }} />

        {/* Glow orbs */}
        <div className="absolute pointer-events-none" style={{
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(88,166,255,0.06)',
          filter: 'blur(80px)',
          top: '10%', left: '10%',
        }} />
        <div className="absolute pointer-events-none" style={{
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(210,168,255,0.06)',
          filter: 'blur(80px)',
          top: '20%', right: '10%',
        }} />

        <div className="relative z-10 max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <div style={{
              background: 'rgba(88,166,255,0.08)',
              border: '1px solid rgba(88,166,255,0.2)',
              borderRadius: 999,
              padding: '6px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--ffv-green)',
                display: 'inline-block',
                boxShadow: '0 0 6px var(--ffv-green)',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ffv-blue)', letterSpacing: '0.05em' }}>
                BLOG · LEARN · GAME
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 7vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: 24,
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #e6edf3 0%, #e6edf3 45%, #58a6ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              IA não é o fim.
            </span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #58a6ff 0%, #d2a8ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              É o seu caminho.
            </span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--ffv-muted)',
            lineHeight: 1.75,
            maxWidth: 560,
            margin: '0 auto 40px',
          }}>
            Pare de ter medo da Inteligência Artificial.
            Aprenda como ela funciona de verdade — e use isso para se tornar
            <strong style={{ color: 'var(--foreground)' }}> indispensável</strong>.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-16">
            <Link href="/fundamentos-da-ia" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px',
              background: 'var(--ffv-blue)',
              color: '#0d1117',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              🚀 Começar do zero
            </Link>
            <Link href="/ia-alem-do-llm" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px',
              background: 'transparent',
              color: 'var(--foreground)',
              border: '1px solid var(--ffv-border)',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'border-color 0.2s',
            }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(210,168,255,0.5)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--ffv-border)')}
            >
              🏗️ Quero o avançado
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { n: String(totalArticles), label: 'artigos técnicos' },
              { n: '2', label: 'trilhas de aprendizado' },
              { n: '7', label: 'níveis de evolução' },
              { n: '100%', label: 'gratuito' },
            ].map((s, i, arr) => (
              <div key={s.n} className="flex items-center gap-8">
                <div className="text-center">
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 4, letterSpacing: '0.03em' }}>{s.label}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 1, height: 32, background: 'var(--ffv-border)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span style={{ fontSize: 11, color: 'var(--ffv-muted)', letterSpacing: '0.08em' }}>SCROLL</span>
          <div style={{
            width: 1, height: 32,
            background: 'linear-gradient(to bottom, var(--ffv-muted), transparent)',
          }} />
        </div>
      </section>

      {/* ════════════════════════════════════════
          PROPOSTA DE VALOR
      ════════════════════════════════════════ */}
      <section className="px-6 py-24" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ffv-blue)', letterSpacing: '0.1em', marginBottom: 12 }}>
              POR QUE ISSO IMPORTA
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Quem entende a ferramenta
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #58a6ff, #d2a8ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                domina o mercado.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: '⚡',
                title: 'Produtividade real',
                desc: 'Não é sobre fazer mais rápido. É sobre fazer o que seria impossível sem IA. Multiplique sua capacidade.',
              },
              {
                icon: '🧠',
                title: 'Entendimento profundo',
                desc: 'Saber usar é bom. Saber como funciona é poder. Aqui você aprende os dois.',
              },
              {
                icon: '🎯',
                title: 'Você mais valorizado',
                desc: 'O mercado paga premium por quem entende IA de verdade. Esse conhecimento é o seu diferencial.',
              },
            ].map(card => (
              <div key={card.title} style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
                borderRadius: 16,
                padding: '28px 24px',
                transition: 'border-color 0.2s',
              }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(88,166,255,0.3)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--ffv-border)')}
              >
                <div style={{ fontSize: 28, marginBottom: 16 }}>{card.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.7 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          QUEM SOU EU
      ════════════════════════════════════════ */}
      <section className="px-6 py-24" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-3xl mx-auto">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '48px',
            alignItems: 'start',
          }}
            className="grid-cols-1 md:grid-cols-[auto_1fr]"
          >
            {/* Avatar placeholder */}
            <div style={{
              width: 80, height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(88,166,255,0.3), rgba(210,168,255,0.3))',
              border: '1px solid rgba(88,166,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, flexShrink: 0,
            }}>
              👨‍💻
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ffv-blue)', letterSpacing: '0.1em', marginBottom: 8 }}>
                O AUTOR
              </p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
                Fernando Franco Valle
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14, color: 'var(--ffv-muted)', lineHeight: 1.8 }}>
                <p>
                  Programo desde os 13 anos. Vi a web nascer, o mobile explodir, a cloud virar padrão.
                  E agora estou vendo a IA mudar tudo — de novo.
                </p>
                <p>
                  Cansei de ver esse assunto dominado pelo medo. Cansei de clickbait, de "a IA vai te
                  substituir", de complexidade desnecessária. Vim fazer o oposto.
                </p>
                <p>
                  <strong style={{ color: 'var(--foreground)' }}>Tudo que aprendo, eu posto aqui</strong> —
                  no formato que sempre quis encontrar: técnico, honesto, gamificado.
                  Porque aprender deveria ter a sensação de progressão de um jogo.
                </p>
              </div>

              <blockquote style={{
                marginTop: 24,
                paddingLeft: 16,
                borderLeft: '2px solid var(--ffv-blue)',
                fontSize: 15,
                fontStyle: 'italic',
                fontWeight: 600,
                color: 'var(--foreground)',
                lineHeight: 1.6,
              }}>
                "A IA não substitui quem sabe usá-la. Ela multiplica."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          COMO FUNCIONA (LEARN GAME)
      ════════════════════════════════════════ */}
      <section className="px-6 py-24" style={{ borderTop: '1px solid var(--ffv-border)', background: 'var(--ffv-bg2)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ffv-purple)', letterSpacing: '0.1em', marginBottom: 12 }}>
              BLOG · LEARN · GAME
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Um blog que funciona
              <br />como um jogo.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ffv-muted)', marginTop: 12, maxWidth: 440, margin: '12px auto 0' }}>
              Cada artigo é um checkpoint. Cada quiz respondido é XP ganho.
              Cada dia de leitura mantém seu streak. Você não só aprende — você evolui.
            </p>
          </div>

          <div className="flex flex-col gap-0">
            {[
              {
                step: '01',
                icon: '📖',
                title: 'Leia o artigo',
                desc: 'Conteúdo técnico real, sem enrolação. Explicado do jeito que você precisava encontrar antes.',
                color: 'var(--ffv-blue)',
              },
              {
                step: '02',
                icon: '🧩',
                title: 'Faça o quiz',
                desc: 'Ao final de cada artigo, 3 perguntas para fixar o conceito. Acertou tudo? Badge de Gabarito.',
                color: 'var(--ffv-purple)',
              },
              {
                step: '03',
                icon: '⚡',
                title: 'Ganhe XP e suba de nível',
                desc: 'Curioso → Aprendiz → Praticante → ... → Mestre da IA. Cada artigo te aproxima do topo.',
                color: 'var(--ffv-orange)',
              },
              {
                step: '04',
                icon: '🔥',
                title: 'Mantenha o streak',
                desc: 'Leia todo dia. Consistência é o único segredo real do aprendizado — e agora ela tem recompensa.',
                color: 'var(--ffv-green)',
              },
            ].map((item, i, arr) => (
              <div key={item.step} style={{
                display: 'flex',
                gap: 20,
                padding: '24px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--ffv-border)' : 'none',
              }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 10,
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: '0.08em' }}>
                      {item.step}
                    </span>
                    <h3 style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* XP levels preview */}
          <div style={{
            marginTop: 40,
            padding: '20px 24px',
            background: 'var(--ffv-bg)',
            border: '1px solid var(--ffv-border)',
            borderRadius: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ffv-muted)', letterSpacing: '0.08em', marginBottom: 14 }}>
              SEUS NÍVEIS DE EVOLUÇÃO
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { icon: '🌱', name: 'Curioso', color: '#8b949e' },
                { icon: '📚', name: 'Aprendiz', color: '#58a6ff' },
                { icon: '⚡', name: 'Praticante', color: '#3fb950' },
                { icon: '🔧', name: 'Desenvolvedor', color: '#ffa657' },
                { icon: '🧠', name: 'Especialista', color: '#d2a8ff' },
                { icon: '🏗️', name: 'Arquiteto', color: '#f78166' },
                { icon: '🚀', name: 'Mestre da IA', color: '#ffa657' },
              ].map((lvl, i) => (
                <div key={lvl.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{lvl.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: lvl.color }}>{lvl.name}</span>
                  {i < 6 && <span style={{ color: 'var(--ffv-border)', marginLeft: 2 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          OS DOIS BLOGS
      ════════════════════════════════════════ */}
      <section className="px-6 py-24" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ffv-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
              ESCOLHA SUA TRILHA
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Dois blogs. Um objetivo.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ffv-muted)', marginTop: 10 }}>
              Você decide por onde começa. Sem pré-requisitos obrigatórios.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 20 }} className="grid-cols-1 md:grid-cols-2">

            {/* Blog 1 */}
            <Link href="/fundamentos-da-ia" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid rgba(88,166,255,0.15)',
                borderRadius: 20,
                padding: '32px 28px',
                height: '100%',
                transition: 'all 0.2s',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'rgba(88,166,255,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(88,166,255,0.08)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'rgba(88,166,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Glow top */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(88,166,255,0.4), transparent)',
                }} />

                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(88,166,255,0.12)',
                  border: '1px solid rgba(88,166,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 20,
                }}>
                  {trail1.icon}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ffv-blue)', letterSpacing: '0.08em' }}>
                    BLOG 01
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    background: 'rgba(88,166,255,0.1)',
                    border: '1px solid rgba(88,166,255,0.2)',
                    color: 'var(--ffv-blue)',
                    padding: '2px 10px', borderRadius: 999,
                  }}>
                    {trail1.modules.length} artigos
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.01em' }}>
                  {trail1.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.75, marginBottom: 20 }}>
                  Do zero ao LLM. O que é IA, como ela aprende, redes neurais,
                  tokens, Transformers — explicado sem enrolação e sem buzzword.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {trail1.modules.slice(0, 4).map(m => (
                    <span key={m.slug} style={{
                      fontSize: 11, color: 'var(--ffv-muted)',
                      background: 'var(--ffv-bg3)',
                      border: '1px solid var(--ffv-border)',
                      padding: '2px 10px', borderRadius: 999,
                    }}>
                      {m.icon} {m.title.split(':')[0].replace('O que é ', '').replace(' (Machine Learning)', '')}
                    </span>
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--ffv-muted)', padding: '2px 4px' }}>
                    +{trail1.modules.length - 4} mais
                  </span>
                </div>

                <div style={{
                  marginTop: 24,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 700, color: 'var(--ffv-blue)',
                }}>
                  Começar a ler <span>→</span>
                </div>
              </div>
            </Link>

            {/* Blog 2 */}
            <Link href="/ia-alem-do-llm" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid rgba(210,168,255,0.15)',
                borderRadius: 20,
                padding: '32px 28px',
                height: '100%',
                transition: 'all 0.2s',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'rgba(210,168,255,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(210,168,255,0.08)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'rgba(210,168,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Glow top */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(210,168,255,0.4), transparent)',
                }} />

                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(210,168,255,0.12)',
                  border: '1px solid rgba(210,168,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 20,
                }}>
                  {trail2.icon}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ffv-purple)', letterSpacing: '0.08em' }}>
                    BLOG 02
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    background: 'rgba(210,168,255,0.1)',
                    border: '1px solid rgba(210,168,255,0.2)',
                    color: 'var(--ffv-purple)',
                    padding: '2px 10px', borderRadius: 999,
                  }}>
                    {trail2.modules.length} artigos
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.01em' }}>
                  {trail2.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.75, marginBottom: 20 }}>
                  Para quem já entende o básico. KV Cache, MoE, Tool Calling,
                  arquitetura de agentes — como os modelos funcionam de verdade em produção.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {trail2.modules.slice(0, 4).map(m => (
                    <span key={m.slug} style={{
                      fontSize: 11, color: 'var(--ffv-muted)',
                      background: 'var(--ffv-bg3)',
                      border: '1px solid var(--ffv-border)',
                      padding: '2px 10px', borderRadius: 999,
                    }}>
                      {m.icon} {m.title.split(':')[0]}
                    </span>
                  ))}
                  {trail2.modules.length > 4 && (
                    <span style={{ fontSize: 11, color: 'var(--ffv-muted)', padding: '2px 4px' }}>
                      +{trail2.modules.length - 4} mais
                    </span>
                  )}
                </div>

                <div style={{
                  marginTop: 24,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 700, color: 'var(--ffv-purple)',
                }}>
                  Começar a ler <span>→</span>
                </div>
              </div>
            </Link>

            {/* Blog 3 */}
            <Link href="/ferramentas-ia-codigo" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid rgba(255,166,87,0.15)',
                borderRadius: 20,
                padding: '32px',
                cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.2s',
                height: '100%',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,166,87,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,166,87,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(255,166,87,0.1)',
                  border: '1px solid rgba(255,166,87,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 20,
                }}>
                  {trail3.icon}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ffv-orange)', letterSpacing: '0.08em' }}>
                    TRILHA 3
                  </span>
                  <span style={{
                    fontSize: 11, background: 'rgba(255,166,87,0.1)',
                    border: '1px solid rgba(255,166,87,0.2)',
                    color: 'var(--ffv-orange)',
                    padding: '2px 10px', borderRadius: 999,
                  }}>
                    {trail3.modules.length} artigos
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.01em' }}>
                  {trail3.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.75, marginBottom: 20 }}>
                  Claude Code vs Codex vs Cursor vs Copilot vs Kiro. As diferenças
                  reais de arquitetura — não benchmarks, não marketing. O que cada
                  ferramenta faz bem e por quê.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {trail3.modules.slice(0, 4).map(m => (
                    <span key={m.slug} style={{
                      fontSize: 11, color: 'var(--ffv-muted)',
                      background: 'var(--ffv-bg3)',
                      border: '1px solid var(--ffv-border)',
                      padding: '2px 8px', borderRadius: 6,
                    }}>
                      {m.icon} {m.title.split(':')[0]}
                    </span>
                  ))}
                  {trail3.modules.length > 4 && (
                    <span style={{ fontSize: 11, color: 'var(--ffv-muted)', padding: '2px 4px' }}>
                      +{trail3.modules.length - 4} mais
                    </span>
                  )}
                </div>

                <div style={{
                  marginTop: 24,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 700, color: 'var(--ffv-orange)',
                }}>
                  Começar a ler <span>→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PARA QUEM É / FINAL CTA
      ════════════════════════════════════════ */}
      <section className="px-6 py-24" style={{ borderTop: '1px solid var(--ffv-border)', background: 'var(--ffv-bg2)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Para quem quer aprender
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #58a6ff, #d2a8ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              de verdade.
            </span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ffv-muted)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.75 }}>
            Devs que querem dominar IA. Curiosos que ouvem falar e querem entender.
            Profissionais que querem ser mais valorizados. Qualquer pessoa que acredita
            que aprender é um superpoder.
          </p>

          <Link href="/fundamentos-da-ia" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 32px',
            background: 'linear-gradient(135deg, var(--ffv-blue), #79b8ff)',
            color: '#0d1117',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 0 32px rgba(88,166,255,0.25)',
            transition: 'all 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            🚀 Começar agora — é gratuito
          </Link>

          <p style={{ fontSize: 12, color: 'var(--ffv-muted)', marginTop: 16 }}>
            Sem cadastro. Sem e-mail. Sem desculpa.
          </p>

          {/* Progress if has XP */}
          {state && state.xp > 0 && (
            <div style={{
              marginTop: 32,
              padding: '16px 24px',
              background: 'var(--ffv-bg)',
              border: '1px solid var(--ffv-border)',
              borderRadius: 12,
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <span style={{ fontSize: 13, color: 'var(--ffv-muted)' }}>
                Você já tem <strong style={{ color: 'var(--ffv-blue)' }}>{state.xp} XP</strong> e completou{' '}
                <strong style={{ color: 'var(--ffv-blue)' }}>{state.completedModules.length}</strong> artigos.
              </span>
              <Link href="/fundamentos-da-ia" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ffv-blue)', textDecoration: 'none' }}>
                Continuar →
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
