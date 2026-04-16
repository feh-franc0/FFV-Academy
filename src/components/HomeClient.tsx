'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { CURRICULUM, type Module, type Trail } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

/** A flat, sortable view of every post with its trail context. */
type PostWithTrail = Module & { trail: Trail; index: number };

const ALL_POSTS: PostWithTrail[] = CURRICULUM.flatMap(trail =>
  trail.modules.map((m, i) => ({ ...m, trail, index: i }))
);

/** Editorial difficulty label derived from XP value. */
function difficultyFor(xp: number): { label: string; level: 1 | 2 | 3 } {
  if (xp <= 40) return { label: 'Iniciante', level: 1 };
  if (xp <= 65) return { label: 'Intermediário', level: 2 };
  return { label: 'Avançado', level: 3 };
}

export function HomeClient() {
  const { state } = useGameState();
  const totalArticles = ALL_POSTS.length;

  // Featured: the "big" article — most XP, most depth. Currently the decision matrix.
  const featured =
    ALL_POSTS.find(p => p.slug === 'qual-coding-agent-usar') ?? ALL_POSTS[ALL_POSTS.length - 1];

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <Hero totalArticles={totalArticles} />
      <FeaturedArticle post={featured} />
      <TrailsSection completedSlugs={state?.completedModules ?? []} />
      <AllPostsSection posts={ALL_POSTS} featuredSlug={featured.slug} />
      <LearnGameSection />
      <AuthorSection />
      <FinalCta state={state} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO — compact, confident, editorial
───────────────────────────────────────────── */
function Hero({ totalArticles }: { totalArticles: number }) {
  return (
    <section className="relative px-6 pt-20 pb-28 md:pt-28 md:pb-32 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--ffv-grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--ffv-grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, #000 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, #000 40%, transparent 80%)',
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--ffv-hero-glow) 0%, transparent 65%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <StatusBadge />
        </div>

        <h1
          className="font-bold"
          style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          Entenda a IA por dentro.
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Não por fora.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
            color: 'var(--ffv-muted)',
            lineHeight: 1.7,
            maxWidth: 640,
            marginBottom: 40,
          }}
        >
          Um blog técnico sobre Inteligência Artificial escrito por quem constrói software há mais de
          uma década. Zero hype, zero clickbait. Arquitetura real, dados públicos, decisões testadas.
          Cada artigo vira XP na sua trilha de aprendizado.
        </p>

        <div className="flex items-center gap-3 flex-wrap mb-14">
          <PrimaryCTA href="/fundamentos-da-ia" color="var(--ffv-blue)">
            Começar do zero
          </PrimaryCTA>
          <GhostCTA href="/ferramentas-ia-codigo">Ver trilha mais recente →</GhostCTA>
        </div>

        <HeroMetrics totalArticles={totalArticles} />
      </div>
    </section>
  );
}

function StatusBadge() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 14px',
        borderRadius: 999,
        background: 'color-mix(in srgb, var(--ffv-blue) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--ffv-blue) 22%, transparent)',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--ffv-green)',
          boxShadow: '0 0 8px var(--ffv-green)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      <span
        className="font-mono"
        style={{ fontSize: 11, fontWeight: 600, color: 'var(--ffv-blue)', letterSpacing: '0.08em' }}
      >
        NOW WRITING · AI SYSTEMS DEEP-DIVES
      </span>
    </div>
  );
}

function HeroMetrics({ totalArticles }: { totalArticles: number }) {
  const items = [
    { n: String(totalArticles), label: 'artigos técnicos' },
    { n: String(CURRICULUM.length), label: 'trilhas de aprendizado' },
    { n: '7', label: 'níveis de evolução' },
    { n: '100%', label: 'gratuito, sem cadastro' },
  ];
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4"
      style={{
        gap: 0,
        borderTop: '1px solid var(--ffv-border)',
        borderBottom: '1px solid var(--ffv-border)',
      }}
    >
      {items.map((s, i) => (
        <div
          key={s.label}
          style={{
            padding: '20px 24px',
            borderRight: i < items.length - 1 ? '1px solid var(--ffv-border)' : undefined,
            borderBottom: i < 2 ? '1px solid var(--ffv-border)' : undefined,
          }}
          className={i < 2 ? 'md:border-b-0' : ''}
        >
          <div
            className="font-mono"
            style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.02em' }}
          >
            {s.n}
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 4, letterSpacing: '0.04em' }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FEATURED — editorial hero article
───────────────────────────────────────────── */
function FeaturedArticle({ post }: { post: PostWithTrail }) {
  const diff = difficultyFor(post.xp);
  return (
    <section className="px-6 py-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-5xl mx-auto">
        <SectionLabel color="var(--ffv-muted)">EM DESTAQUE</SectionLabel>

        <Link
          href={`/aprenda/${post.slug}`}
          className="block group mt-4"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <article
            className="relative overflow-hidden"
            style={{
              background: 'var(--ffv-bg2)',
              border: `1px solid ${post.trail.color}20`,
              borderRadius: 24,
              padding: 0,
              transition: 'all 0.25s ease',
              boxShadow: 'var(--ffv-shadow-soft)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = `${post.trail.color}55`;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--ffv-shadow-lift)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = `${post.trail.color}20`;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--ffv-shadow-soft)';
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 60% 80% at 100% 0%, ${post.trail.color}14, transparent 60%)`,
              }}
            />

            <div className="grid md:grid-cols-[1fr_auto] gap-8 relative" style={{ padding: '40px 36px' }}>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-5">
                  <TrailPill trail={post.trail} />
                  <MetaPill>{post.readTime} min de leitura</MetaPill>
                  <MetaPill>+{post.xp} XP</MetaPill>
                  <DifficultyPill diff={diff} />
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    marginBottom: 16,
                    color: 'var(--foreground)',
                  }}
                >
                  {post.title}
                </h2>

                <p
                  style={{
                    fontSize: '1.05rem',
                    color: 'var(--ffv-muted)',
                    lineHeight: 1.7,
                    maxWidth: 640,
                    marginBottom: 24,
                  }}
                >
                  {post.desc}
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: post.trail.color,
                  }}
                >
                  Ler o artigo completo
                  <span
                    style={{
                      transition: 'transform 0.2s ease',
                      display: 'inline-block',
                    }}
                    className="group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </div>

              <div
                className="hidden md:flex items-center justify-center"
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 28,
                  background: `color-mix(in srgb, ${post.trail.color} 10%, transparent)`,
                  border: `1px solid ${post.trail.color}30`,
                  fontSize: 56,
                  flexShrink: 0,
                }}
              >
                {post.icon}
              </div>
            </div>
          </article>
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ALL POSTS — editorial grid with briefing
───────────────────────────────────────────── */
function AllPostsSection({ posts, featuredSlug }: { posts: PostWithTrail[]; featuredSlug: string }) {
  const list = posts.filter(p => p.slug !== featuredSlug);
  return (
    <section className="px-6 py-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <SectionLabel color="var(--ffv-muted)">TODOS OS ARTIGOS</SectionLabel>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginTop: 8,
              }}
            >
              Cada post é um checkpoint. Cada clique, uma trilha.
            </h2>
          </div>
          <p
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--ffv-muted)', letterSpacing: '0.05em' }}
          >
            {list.length + 1} POSTS PUBLICADOS
          </p>
        </div>

        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
        >
          {list.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }: { post: PostWithTrail }) {
  const diff = difficultyFor(post.xp);
  return (
    <Link
      href={`/aprenda/${post.slug}`}
      className="block group"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <article
        className="h-full flex flex-col"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          borderRadius: 18,
          padding: '24px 22px',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = `${post.trail.color}55`;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--ffv-shadow-lift)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = 'var(--ffv-border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Colored top accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${post.trail.color}, transparent)`,
            opacity: 0.6,
          }}
        />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `color-mix(in srgb, ${post.trail.color} 12%, transparent)`,
              border: `1px solid ${post.trail.color}30`,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {post.icon}
          </div>
          <TrailPill trail={post.trail} compact />
        </div>

        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            marginBottom: 10,
            color: 'var(--foreground)',
          }}
        >
          {post.title}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: 'var(--ffv-muted)',
            lineHeight: 1.6,
            marginBottom: 18,
            flex: 1,
          }}
        >
          {post.desc}
        </p>

        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--ffv-border)' }}
        >
          <div className="flex items-center gap-3">
            <MetaText>{post.readTime}m</MetaText>
            <MetaDot />
            <MetaText>+{post.xp} XP</MetaText>
            <MetaDot />
            <MetaText>{diff.label}</MetaText>
          </div>
          <span
            style={{
              fontSize: 13,
              color: post.trail.color,
              fontWeight: 700,
              transition: 'transform 0.2s ease',
            }}
            className="group-hover:translate-x-0.5 inline-block"
          >
            →
          </span>
        </div>
      </article>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   TRAILS as reading paths
───────────────────────────────────────────── */
function TrailsSection({ completedSlugs }: { completedSlugs: string[] }) {
  return (
    <section
      className="px-6 py-20"
      style={{ borderTop: '1px solid var(--ffv-border)', background: 'var(--ffv-bg2)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 max-w-2xl">
          <SectionLabel color="var(--ffv-purple)">READING PATHS</SectionLabel>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginTop: 8,
              lineHeight: 1.2,
            }}
          >
            Três trilhas curadas. Leia na ordem ou salte.
          </h2>
          <p
            style={{ fontSize: 14, color: 'var(--ffv-muted)', marginTop: 10, lineHeight: 1.7 }}
          >
            Cada trilha é uma sequência pensada — você pode abrir do primeiro ao último ou pegar
            apenas o post que te interessa. O progresso é seu, salvo localmente no navegador.
          </p>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {CURRICULUM.map((trail, idx) => {
            const done = trail.modules.filter(m => completedSlugs.includes(m.slug)).length;
            return (
              <TrailCard
                key={trail.id}
                trail={trail}
                number={idx + 1}
                done={done}
                completedSlugs={completedSlugs}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrailCard({
  trail,
  number,
  done,
  completedSlugs,
}: {
  trail: Trail;
  number: number;
  done: number;
  completedSlugs: string[];
}) {
  const pct = Math.round((done / trail.modules.length) * 100);
  const hrefByTrailId: Record<string, string> = {
    trail1: '/fundamentos-da-ia',
    trail2: '/ia-alem-do-llm',
    trail3: '/ferramentas-ia-codigo',
    trail4: '/aws-cloud-practitioner',
    trail5: '/aws-saa-c03',
  };
  const href = hrefByTrailId[trail.id] ?? '/';

  return (
    <Link href={href} className="block group" style={{ textDecoration: 'none', color: 'inherit' }}>
      <article
        className="h-full flex flex-col"
        style={{
          background: 'var(--ffv-bg)',
          border: `1px solid ${trail.color}22`,
          borderRadius: 20,
          padding: '28px 24px',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = `${trail.color}55`;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--ffv-shadow-lift)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = `${trail.color}22`;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${trail.color}, transparent)`,
          }}
        />

        <div className="flex items-center justify-between mb-5">
          <span
            className="font-mono"
            style={{ fontSize: 11, color: trail.color, letterSpacing: '0.08em', fontWeight: 700 }}
          >
            TRILHA {String(number).padStart(2, '0')}
          </span>
          <div
            className="flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `color-mix(in srgb, ${trail.color} 12%, transparent)`,
              border: `1px solid ${trail.color}30`,
              fontSize: 20,
            }}
          >
            {trail.icon}
          </div>
        </div>

        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            marginBottom: 10,
            color: 'var(--foreground)',
          }}
        >
          {trail.name}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: 'var(--ffv-muted)',
            lineHeight: 1.65,
            marginBottom: 20,
          }}
        >
          {trail.desc}
        </p>

        <ul className="flex flex-col gap-1.5 mb-5 flex-1">
          {trail.modules.slice(0, 4).map(m => {
            const isDone = completedSlugs.includes(m.slug);
            return (
              <li key={m.slug} className="flex items-center gap-2">
                <span
                  className="flex-shrink-0"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: isDone ? 'var(--ffv-green)' : trail.color,
                    opacity: isDone ? 1 : 0.5,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--ffv-muted)',
                    lineHeight: 1.5,
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}
                >
                  {m.title}
                </span>
              </li>
            );
          })}
          {trail.modules.length > 4 && (
            <li
              className="font-mono"
              style={{ fontSize: 11, color: 'var(--ffv-muted)', paddingLeft: 12, marginTop: 4 }}
            >
              + {trail.modules.length - 4} posts
            </li>
          )}
        </ul>

        {done > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="font-mono"
                style={{ fontSize: 10, color: 'var(--ffv-muted)', letterSpacing: '0.05em' }}
              >
                PROGRESSO
              </span>
              <span
                className="font-mono"
                style={{ fontSize: 10, color: trail.color, fontWeight: 700 }}
              >
                {done}/{trail.modules.length}
              </span>
            </div>
            <div
              style={{
                height: 3,
                background: 'var(--ffv-bg3)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: trail.color,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid var(--ffv-border)' }}
        >
          <span
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--ffv-muted)', letterSpacing: '0.03em' }}
          >
            {trail.modules.length} POSTS
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: trail.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Explorar trilha
            <span className="group-hover:translate-x-1 inline-block" style={{ transition: 'transform 0.2s ease' }}>
              →
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   LEARN · GAME — gamification explainer
───────────────────────────────────────────── */
function LearnGameSection() {
  const steps = [
    { n: '01', icon: '📖', title: 'Leia o artigo', desc: 'Conteúdo técnico real. Arquitetura, dados, decisões testadas em produção.', color: 'var(--ffv-blue)' },
    { n: '02', icon: '🧩', title: 'Resolva o quiz', desc: 'Três perguntas ao final. Acertou tudo? Badge de Gabarito.', color: 'var(--ffv-purple)' },
    { n: '03', icon: '⚡', title: 'Ganhe XP', desc: 'Curioso → Aprendiz → Praticante → ... → Mestre. Cada post te aproxima do topo.', color: 'var(--ffv-orange)' },
    { n: '04', icon: '🔥', title: 'Mantenha o streak', desc: 'Consistência é o único segredo real. Agora com recompensa visível.', color: 'var(--ffv-green)' },
  ];
  const levels = [
    { icon: '🌱', name: 'Curioso', color: '#8b949e' },
    { icon: '📚', name: 'Aprendiz', color: '#58a6ff' },
    { icon: '⚡', name: 'Praticante', color: '#3fb950' },
    { icon: '🔧', name: 'Desenvolvedor', color: '#ffa657' },
    { icon: '🧠', name: 'Especialista', color: '#d2a8ff' },
    { icon: '🏗️', name: 'Arquiteto', color: '#f78166' },
    { icon: '🚀', name: 'Mestre da IA', color: '#ffa657' },
  ];

  return (
    <section className="px-6 py-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 max-w-2xl">
          <SectionLabel color="var(--ffv-orange)">BLOG · LEARN · GAME</SectionLabel>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginTop: 8,
              lineHeight: 1.2,
            }}
          >
            Um blog que funciona como um jogo.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ffv-muted)', marginTop: 10, lineHeight: 1.7 }}>
            Cada artigo é um checkpoint. Cada quiz respondido é XP ganho. Cada dia de leitura
            mantém seu streak. Você não só aprende — você evolui.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {steps.map(s => (
            <div
              key={s.n}
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
                borderRadius: 16,
                padding: '22px 20px',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `color-mix(in srgb, ${s.color} 14%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${s.color} 30%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                  }}
                >
                  {s.icon}
                </div>
                <span
                  className="font-mono"
                  style={{ fontSize: 11, color: s.color, letterSpacing: '0.08em', fontWeight: 700 }}
                >
                  {s.n}
                </span>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: 'var(--foreground)' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--ffv-muted)', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
            borderRadius: 16,
            padding: '20px 24px',
          }}
        >
          <p
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--ffv-muted)', letterSpacing: '0.08em', marginBottom: 14 }}
          >
            NÍVEIS DE EVOLUÇÃO
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {levels.map((lvl, i) => (
              <div key={lvl.name} className="flex items-center gap-2">
                <span style={{ fontSize: 14 }}>{lvl.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: lvl.color }}>{lvl.name}</span>
                {i < levels.length - 1 && (
                  <span style={{ color: 'var(--ffv-border)' }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   AUTHOR — compact bio
───────────────────────────────────────────── */
function AuthorSection() {
  return (
    <section
      className="px-6 py-20"
      style={{ borderTop: '1px solid var(--ffv-border)', background: 'var(--ffv-bg2)' }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="grid md:grid-cols-[auto_1fr] gap-10 items-start">
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--ffv-blue) 30%, transparent), color-mix(in srgb, var(--ffv-purple) 30%, transparent))',
              border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              flexShrink: 0,
            }}
          >
            👨‍💻
          </div>
          <div>
            <SectionLabel color="var(--ffv-blue)">O AUTOR</SectionLabel>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                marginTop: 8,
                marginBottom: 16,
                letterSpacing: '-0.02em',
              }}
            >
              Fernando Franco Valle
            </h2>
            <div
              className="flex flex-col gap-3"
              style={{ fontSize: 14, color: 'var(--ffv-muted)', lineHeight: 1.75 }}
            >
              <p>
                Programo desde os 13 anos. Vi a web nascer, o mobile explodir, a cloud virar padrão.
                E agora estou vendo a IA mudar tudo — de novo.
              </p>
              <p>
                Cansei de ver esse assunto dominado pelo medo. Cansei de clickbait, de "a IA vai te
                substituir", de complexidade desnecessária. Vim fazer o oposto.
              </p>
              <p>
                <strong style={{ color: 'var(--foreground)' }}>
                  Tudo que aprendo, eu posto aqui
                </strong>
                {' '}— no formato que sempre quis encontrar: técnico, honesto, gamificado.
              </p>
            </div>
            <blockquote
              style={{
                marginTop: 22,
                paddingLeft: 16,
                borderLeft: '3px solid var(--ffv-blue)',
                fontSize: 15,
                fontStyle: 'italic',
                fontWeight: 600,
                color: 'var(--foreground)',
                lineHeight: 1.5,
              }}
            >
              "A IA não substitui quem sabe usá-la. Ela multiplica."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────────── */
function FinalCta({ state }: { state: ReturnType<typeof useGameState>['state'] }) {
  return (
    <section className="px-6 py-24" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <h2
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 14,
            lineHeight: 1.2,
          }}
        >
          Para quem quer aprender
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            de verdade.
          </span>
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--ffv-muted)',
            maxWidth: 480,
            margin: '0 auto 32px',
            lineHeight: 1.7,
          }}
        >
          Devs que querem dominar IA. Curiosos que ouvem falar e querem entender. Profissionais
          que querem ser mais valorizados.
        </p>

        <PrimaryCTA href="/fundamentos-da-ia" color="var(--ffv-blue)" big>
          Começar agora — é gratuito
        </PrimaryCTA>

        <p
          className="font-mono"
          style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 14, letterSpacing: '0.04em' }}
        >
          SEM CADASTRO · SEM E-MAIL · SEM DESCULPA
        </p>

        {state && state.xp > 0 && (
          <div
            style={{
              marginTop: 32,
              padding: '14px 20px',
              background: 'var(--ffv-bg2)',
              border: '1px solid var(--ffv-border)',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 18 }}>⚡</span>
            <span style={{ fontSize: 13, color: 'var(--ffv-muted)' }}>
              Você já tem{' '}
              <strong style={{ color: 'var(--ffv-blue)' }}>{state.xp} XP</strong> e completou{' '}
              <strong style={{ color: 'var(--ffv-blue)' }}>
                {state.completedModules.length}
              </strong>{' '}
              artigo{state.completedModules.length !== 1 ? 's' : ''}.
            </span>
            <Link
              href="/fundamentos-da-ia"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--ffv-blue)',
                textDecoration: 'none',
              }}
            >
              Continuar →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Tiny primitives
───────────────────────────────────────────── */
function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p
      className="font-mono"
      style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.1em' }}
    >
      {children}
    </p>
  );
}

function TrailPill({ trail, compact = false }: { trail: Trail; compact?: boolean }) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: compact ? '2px 8px' : '3px 10px',
    borderRadius: 999,
    background: `color-mix(in srgb, ${trail.color} 10%, transparent)`,
    border: `1px solid color-mix(in srgb, ${trail.color} 28%, transparent)`,
    color: trail.color,
    fontSize: compact ? 10 : 11,
    fontWeight: 700,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-roboto-mono)',
  };
  return (
    <span style={style}>
      <span style={{ fontSize: compact ? 10 : 11 }}>{trail.icon}</span>
      {trail.name.toUpperCase()}
    </span>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 11,
        color: 'var(--ffv-muted)',
        padding: '2px 10px',
        borderRadius: 999,
        background: 'var(--ffv-bg3)',
        border: '1px solid var(--ffv-border)',
        letterSpacing: '0.03em',
      }}
    >
      {children}
    </span>
  );
}

function DifficultyPill({ diff }: { diff: { label: string; level: 1 | 2 | 3 } }) {
  return (
    <span
      className="font-mono inline-flex items-center gap-1.5"
      style={{
        fontSize: 11,
        color: 'var(--ffv-muted)',
        padding: '2px 10px',
        borderRadius: 999,
        background: 'var(--ffv-bg3)',
        border: '1px solid var(--ffv-border)',
        letterSpacing: '0.03em',
      }}
    >
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {[1, 2, 3].map(l => (
          <span
            key={l}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: l <= diff.level ? 'var(--ffv-orange)' : 'var(--ffv-border)',
            }}
          />
        ))}
      </span>
      {diff.label}
    </span>
  );
}

function MetaText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono"
      style={{ fontSize: 11, color: 'var(--ffv-muted)', letterSpacing: '0.03em' }}
    >
      {children}
    </span>
  );
}

function MetaDot() {
  return (
    <span
      aria-hidden
      style={{ width: 2, height: 2, borderRadius: '50%', background: 'var(--ffv-border)' }}
    />
  );
}

function PrimaryCTA({
  href,
  children,
  color,
  big = false,
}: {
  href: string;
  children: React.ReactNode;
  color: string;
  big?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: big ? '14px 28px' : '12px 24px',
        background: color,
        color: 'var(--primary-foreground)',
        borderRadius: 10,
        fontWeight: 700,
        fontSize: big ? 15 : 14,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        boxShadow: `0 0 24px color-mix(in srgb, ${color} 25%, transparent)`,
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = `0 0 32px color-mix(in srgb, ${color} 40%, transparent)`;
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 0 24px color-mix(in srgb, ${color} 25%, transparent)`;
      }}
    >
      {children}
    </Link>
  );
}

function GhostCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 24px',
        background: 'transparent',
        color: 'var(--foreground)',
        border: '1px solid var(--ffv-border)',
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 14,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = 'var(--ffv-blue)';
        e.currentTarget.style.color = 'var(--ffv-blue)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'var(--ffv-border)';
        e.currentTarget.style.color = 'var(--foreground)';
      }}
    >
      {children}
    </Link>
  );
}
