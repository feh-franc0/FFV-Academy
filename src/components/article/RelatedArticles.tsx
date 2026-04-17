'use client';

import Link from 'next/link';
import { CURRICULUM, HUBS, getHubForTrail, type Module, type Trail } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

interface Props {
  currentSlug: string;
}

type Card = {
  kind: 'next' | 'cross-hub' | 'review';
  label: string;
  title: string;
  icon: string;
  accent: string;
  href: string;
  meta: string;
};

function findTrail(slug: string): Trail | undefined {
  return CURRICULUM.find(t => t.modules.some(m => m.slug === slug));
}

function buildCards(
  currentSlug: string,
  completedSlugs: string[],
  dueCount: number,
): Card[] {
  const out: Card[] = [];
  const trail = findTrail(currentSlug);
  const currentIdx = trail?.modules.findIndex(m => m.slug === currentSlug) ?? -1;
  const nextInTrail: Module | undefined = trail && currentIdx >= 0 ? trail.modules[currentIdx + 1] : undefined;

  if (nextInTrail && trail) {
    out.push({
      kind: 'next',
      label: 'PRÓXIMO NA TRILHA',
      title: nextInTrail.title,
      icon: nextInTrail.icon,
      accent: trail.color,
      href: `/aprenda/${nextInTrail.slug}`,
      meta: `${nextInTrail.readTime} min · +${nextInTrail.xp} XP`,
    });
  } else if (trail) {
    // End of trail — suggest first unfinished of next trail in same hub
    const hub = getHubForTrail(trail.id);
    if (hub) {
      const siblingTrailIds = hub.trailIds.filter(id => id !== trail.id);
      for (const siblingId of siblingTrailIds) {
        const sibling = CURRICULUM.find(t => t.id === siblingId);
        if (!sibling) continue;
        const unread = sibling.modules.find(m => !completedSlugs.includes(m.slug));
        if (unread) {
          out.push({
            kind: 'next',
            label: 'CONTINUE NO HUB',
            title: unread.title,
            icon: unread.icon,
            accent: sibling.color,
            href: `/aprenda/${unread.slug}`,
            meta: `${sibling.name} · ${unread.readTime} min`,
          });
          break;
        }
      }
    }
  }

  // Cross-hub recommendation — first unread from a different hub
  if (trail) {
    const currentHub = getHubForTrail(trail.id);
    for (const hub of HUBS) {
      if (hub.id === currentHub?.id) continue;
      const candidateTrail = CURRICULUM.find(t => hub.trailIds.includes(t.id));
      if (!candidateTrail) continue;
      const unread = candidateTrail.modules.find(m => !completedSlugs.includes(m.slug));
      if (unread) {
        out.push({
          kind: 'cross-hub',
          label: `EXPLORAR · ${hub.name.toUpperCase()}`,
          title: unread.title,
          icon: unread.icon,
          accent: hub.color,
          href: `/aprenda/${unread.slug}`,
          meta: `${candidateTrail.name} · ${unread.readTime} min`,
        });
        break;
      }
    }
  }

  // Review card if there are due cards
  if (dueCount > 0) {
    out.push({
      kind: 'review',
      label: 'FIXE O QUE APRENDEU',
      title: `${dueCount} card${dueCount !== 1 ? 's' : ''} devido${dueCount !== 1 ? 's' : ''}`,
      icon: '🧠',
      accent: 'var(--ffv-green)',
      href: '/revisar',
      meta: 'Revisão espaçada · SRS',
    });
  }

  return out.slice(0, 3);
}

export function RelatedArticles({ currentSlug }: Props) {
  const { state, dueCards } = useGameState();
  const completed = state?.completedModules ?? [];
  const cards = buildCards(currentSlug, completed, dueCards.length);

  if (cards.length === 0) return null;

  return (
    <section className="mt-12" aria-label="Continuar lendo">
      <div
        className="h-px mb-8"
        style={{ background: 'var(--ffv-border)' }}
      />
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--ffv-muted)',
          fontWeight: 700,
          marginBottom: 14,
        }}
      >
        Continue lendo
      </div>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
      >
        {cards.map((c, i) => (
          <Link
            key={i}
            href={c.href}
            className="group block"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <article
              className="h-full flex flex-col"
              style={{
                background: 'var(--ffv-bg2)',
                border: `1px solid color-mix(in srgb, ${c.accent} 24%, transparent)`,
                borderRadius: 14,
                padding: '16px 16px 14px',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${c.accent} 65%, transparent)`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${c.accent} 24%, transparent)`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 9,
                    color: c.accent,
                    letterSpacing: '0.14em',
                    fontWeight: 700,
                  }}
                >
                  {c.label}
                </span>
              </div>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: 'var(--foreground)',
                  marginBottom: 6,
                  letterSpacing: '-0.01em',
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  fontSize: 11.5,
                  color: 'var(--ffv-muted)',
                  lineHeight: 1.5,
                  marginTop: 'auto',
                }}
              >
                {c.meta}{' '}
                <span
                  className="group-hover:translate-x-0.5 inline-block"
                  style={{ color: c.accent, fontWeight: 700, transition: 'transform 0.2s ease' }}
                >
                  →
                </span>
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
