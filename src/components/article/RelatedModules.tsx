'use client';

import Link from 'next/link';
import { CURRICULUM } from '@/lib/curriculum';

interface Props {
  slugs: string[];
  title?: string;
}

export function RelatedModules({ slugs, title = 'Artigos relacionados' }: Props) {
  const modules = slugs.flatMap(slug => {
    for (const trail of CURRICULUM) {
      const mod = trail.modules.find(m => m.slug === slug);
      if (mod) return [{ mod, trail }];
    }
    return [];
  });

  if (modules.length === 0) return null;

  return (
    <section className="mt-10" aria-label={title}>
      <div className="h-px mb-6" style={{ background: 'var(--ffv-border)' }} />
      <p
        className="font-mono uppercase mb-4"
        style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ffv-muted)', fontWeight: 700 }}
      >
        {title}
      </p>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {modules.map(({ mod, trail }) => (
          <Link
            key={mod.slug}
            href={`/aprenda/${mod.slug}`}
            className="group block"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <article
              className="h-full flex flex-col transition-all"
              style={{
                background: 'var(--ffv-bg2)',
                border: `1px solid color-mix(in srgb, ${trail.color} 22%, transparent)`,
                borderRadius: 12,
                padding: '14px 14px 12px',
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${trail.color} 55%, transparent)`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${trail.color} 22%, transparent)`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: 20 }}>{mod.icon}</span>
                <span
                  className="font-mono truncate"
                  style={{ fontSize: 9, color: trail.color, letterSpacing: '0.12em', fontWeight: 700 }}
                >
                  {trail.name.toUpperCase()}
                </span>
              </div>
              <h3
                className="font-bold leading-snug mb-2 group-hover:underline"
                style={{ fontSize: 13, color: 'var(--foreground)', letterSpacing: '-0.01em' }}
              >
                {mod.title}
              </h3>
              <div className="flex items-center gap-2 mt-auto" style={{ fontSize: 11, color: 'var(--ffv-muted)' }}>
                <span>⏱ {mod.readTime} min</span>
                <span>·</span>
                <span style={{ color: trail.color, fontWeight: 600 }}>+{mod.xp} XP →</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
