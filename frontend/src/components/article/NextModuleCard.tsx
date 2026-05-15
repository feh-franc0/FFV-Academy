'use client';

import Link from 'next/link';
import { type Module, type Trail } from '@/lib/curriculum';

interface NextModuleCardProps {
  module: Pick<Module, 'title' | 'slug' | 'icon' | 'readTime' | 'xp'>;
  trail: Pick<Trail, 'name' | 'color'>;
}

export function NextModuleCard({ module, trail }: NextModuleCardProps) {
  return (
    <div
      className="mt-10 rounded-xl overflow-hidden"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        borderLeft: '4px solid var(--ffv-blue)',
      }}
    >
      <Link
        href={`/aprenda/${module.slug}`}
        className="flex items-center gap-4 p-5 group"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {/* Icon */}
        <span className="text-3xl shrink-0" aria-hidden="true">
          {module.icon}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="font-mono uppercase mb-1"
            style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ffv-blue)', fontWeight: 700 }}
          >
            Próximo na trilha · {trail.name}
          </p>
          <p
            className="font-bold truncate"
            style={{ fontSize: 15, color: 'var(--foreground)', lineHeight: 1.3 }}
          >
            {module.title}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--ffv-muted)' }}
          >
            {module.readTime} min de leitura · +{module.xp} XP
          </p>
        </div>

        {/* Arrow */}
        <span
          className="shrink-0 text-lg font-bold transition-transform group-hover:translate-x-1"
          style={{ color: 'var(--ffv-blue)' }}
          aria-hidden="true"
        >
          →
        </span>
      </Link>

      {/* CTA button row */}
      <div className="px-5 pb-5 pt-0">
        <Link
          href={`/aprenda/${module.slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--ffv-blue)', color: '#fff' }}
        >
          Continuar →
        </Link>
      </div>
    </div>
  );
}
