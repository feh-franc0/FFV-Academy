'use client';

import Link from 'next/link';

/**
 * Hero destacado na Home apontando para o produto de simulados.
 * Aparece após o Hero principal e antes da seção de hubs.
 */
export function SimuladosHero() {
  return (
    <section className="px-6 py-10 max-w-5xl mx-auto">
      <Link
        href="/simulados"
        className="block rounded-2xl overflow-hidden transition-all hover:scale-[1.005]"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, #f78166 18%, var(--ffv-bg2)), color-mix(in srgb, #d29922 10%, var(--ffv-bg2)))',
          border: '1px solid #f7816640',
        }}
      >
        <div className="p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(247,129,102,0.18)', color: '#f78166', border: '1px solid #f7816640' }}
              >
                🎯 Novo · Produto pago
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Prepare-se para certificações com simulados + tutor IA
            </h2>
            <p className="text-sm md:text-base mb-4" style={{ color: 'var(--ffv-muted)' }}>
              Comece com o AWS Cloud Practitioner. <b>10 questões grátis</b>, depois desbloqueie o simulado completo com tutor que explica cada questão por dentro.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm" style={{ background: '#f78166', color: '#0d1117' }}>
                Ver simulados →
              </span>
              <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                A partir de R$ 47 · Acesso vitalício
              </span>
            </div>
          </div>
          <div className="hidden md:block text-6xl" style={{ opacity: 0.7 }}>
            🎯
          </div>
        </div>
      </Link>
    </section>
  );
}
