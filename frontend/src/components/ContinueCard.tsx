'use client';

import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { HUBS } from '@/lib/curriculum/hubs';
// Índice leve — este componente só usa slug/title/icon/xp/readTime/color/name,
// todos presentes em CURRICULO_LEVE. Renderiza na home (rota de maior
// tráfego), então evita os ~92 KB gz de `desc`/`keywords` do currículo cheio.
// `getHubBySlug`/`getHubTrailsLeve` vêm de `queries-leves.ts` (caminho
// estreito) — nunca do barril `@/lib/curriculum`, que arrasta `queries.ts` e,
// com ele, o currículo completo.
import { CURRICULO_LEVE, type ModuloLeve, type TrilhaLeve } from '@/lib/curriculum/indice-leve';
import { getHubBySlug, getHubTrailsLeve } from '@/lib/curriculum/queries-leves';

type Suggestion = {
  kind: 'resume' | 'next-in-trail' | 'start-preferred' | 'start-fresh';
  label: string;
  title: string;
  icon: string;
  accent: string;
  href: string;
  meta?: string;
  progressPct?: number;
  trailName: string;
};

function allPosts(): Array<{ mod: ModuloLeve; trail: TrilhaLeve }> {
  return CURRICULO_LEVE.flatMap(t => t.modules.map(m => ({ mod: m, trail: t })));
}

function buildSuggestion(
  state: ReturnType<typeof useGameState>['state'],
): Suggestion | null {
  if (!state) return null;
  const completed = state.completedModules;
  const all = allPosts();

  // 1. Active article not finished yet
  if (state.lastArticle && !completed.includes(state.lastArticle.slug)) {
    const la = state.lastArticle;
    const progressPct = Math.round(la.progress * 100);
    return {
      kind: 'resume',
      label: 'CONTINUE DE ONDE PAROU',
      title: la.title,
      icon: la.icon,
      accent: la.trailColor,
      href: la.href,
      meta: progressPct > 0 ? `${progressPct}% lido · ${la.readTime} min restantes` : `${la.readTime} min de leitura`,
      progressPct,
      trailName: la.trailName,
    };
  }

  // 2. Next unfinished in the last-seen trail
  if (state.lastArticle) {
    const la = state.lastArticle;
    const trail = CURRICULO_LEVE.find(t => t.modules.some(m => m.slug === la.slug));
    if (trail) {
      const nextMod = trail.modules.find(m => !completed.includes(m.slug));
      if (nextMod) {
        return {
          kind: 'next-in-trail',
          label: 'PRÓXIMO NA TRILHA',
          title: nextMod.title,
          icon: nextMod.icon,
          accent: trail.color,
          href: `/aprenda/${nextMod.slug}`,
          meta: `${nextMod.readTime} min · +${nextMod.xp} XP`,
          trailName: trail.name,
        };
      }
    }
  }

  // 3. First article of preferred hub (from onboarding)
  if (state.preferredHub) {
    const hub = getHubBySlug(state.preferredHub);
    if (hub) {
      const trails = getHubTrailsLeve(hub);
      for (const trail of trails) {
        const firstUndone = trail.modules.find(m => !completed.includes(m.slug));
        if (firstUndone) {
          return {
            kind: 'start-preferred',
            label: `COMECE POR ${hub.name.toUpperCase()}`,
            title: firstUndone.title,
            icon: firstUndone.icon,
            accent: hub.color,
            href: `/aprenda/${firstUndone.slug}`,
            meta: `${firstUndone.readTime} min · +${firstUndone.xp} XP`,
            trailName: trail.name,
          };
        }
      }
    }
  }

  // 4. Brand new user: suggest first unread article anywhere
  const firstUnread = all.find(({ mod }) => !completed.includes(mod.slug));
  if (firstUnread) {
    return {
      kind: 'start-fresh',
      label: 'RECOMENDADO PARA COMEÇAR',
      title: firstUnread.mod.title,
      icon: firstUnread.mod.icon,
      accent: firstUnread.trail.color,
      href: `/aprenda/${firstUnread.mod.slug}`,
      meta: `${firstUnread.mod.readTime} min · +${firstUnread.mod.xp} XP`,
      trailName: firstUnread.trail.name,
    };
  }

  return null;
}

export function ContinueCard() {
  const { state } = useGameState();
  if (!state) return null;

  const hasAny = state.completedModules.length > 0 || state.lastArticle;
  if (!hasAny) return null; // keep the hero clean for first-timers

  const s = buildSuggestion(state);
  if (!s) return null;

  const hubChip = HUBS.find(h => state.preferredHub === h.slug);

  return (
    <section className="px-6 pt-8" aria-label="Retomar leitura">
      <div className="max-w-5xl mx-auto">
        <Link
          href={s.href}
          className="block group"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <article
            className="relative overflow-hidden"
            style={{
              background: 'var(--ffv-bg2)',
              border: `1px solid color-mix(in srgb, ${s.accent} 35%, transparent)`,
              borderRadius: 18,
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = `color-mix(in srgb, ${s.accent} 70%, transparent)`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--ffv-shadow-lift)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = `color-mix(in srgb, ${s.accent} 35%, transparent)`;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 50% 80% at 0% 50%, color-mix(in srgb, ${s.accent} 18%, transparent), transparent 65%)`,
              }}
            />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 sm:p-6">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `color-mix(in srgb, ${s.accent} 14%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${s.accent} 34%, transparent)`,
                  fontSize: 26,
                }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: s.accent,
                      letterSpacing: '0.14em',
                      fontWeight: 700,
                    }}
                  >
                    {s.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ffv-muted)' }}>·</span>
                  <span style={{ fontSize: 11, color: 'var(--ffv-muted)' }}>{s.trailName}</span>
                  {hubChip && s.kind === 'start-preferred' && (
                    <span
                      className="font-mono ffv-acento-texto"
                      style={{
                        fontSize: 9,
                        padding: '1px 6px',
                        borderRadius: 999,
                        '--ffv-acento': hubChip.color,
                        background: `color-mix(in srgb, ${hubChip.color} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${hubChip.color} 30%, transparent)`,
                        letterSpacing: '0.08em',
                      } as React.CSSProperties}
                    >
                      SEU HUB
                    </span>
                  )}
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(1.15rem, 2.2vw, 1.5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'var(--foreground)',
                  }}
                >
                  {s.title}
                </h2>
                {s.meta && (
                  <p style={{ fontSize: 12, color: 'var(--ffv-muted)', marginTop: 4 }}>{s.meta}</p>
                )}
                {typeof s.progressPct === 'number' && s.progressPct > 0 && (
                  <div
                    className="mt-3"
                    style={{
                      height: 3,
                      background: 'var(--ffv-bg3)',
                      borderRadius: 999,
                      overflow: 'hidden',
                      maxWidth: 320,
                    }}
                  >
                    <div
                      style={{
                        width: `${s.progressPct}%`,
                        height: '100%',
                        background: s.accent,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                )}
              </div>
              <span
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold"
                style={{
                  background: s.accent,
                  color: '#0d1117',
                  fontSize: 13,
                  transition: 'transform 0.2s ease',
                }}
              >
                {s.kind === 'resume' ? 'Continuar' : 'Ler agora'}
                <span className="group-hover:translate-x-0.5 inline-block" style={{ transition: 'transform 0.2s ease' }}>→</span>
              </span>
            </div>
          </article>
        </Link>
      </div>
    </section>
  );
}
