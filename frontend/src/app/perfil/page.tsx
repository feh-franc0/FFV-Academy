import type { Metadata } from 'next';
import { DevProfileClient } from '@/components/DevProfileClient';
import { ProfilePreferencesForm } from '@/components/profile/ProfilePreferencesForm';

export const metadata: Metadata = {
  title: 'Perfil — FFV Academy',
  description:
    'Seu perfil de aprendizado: preferências, áreas de interesse, ritmo de estudo, conquistas e progresso por trilha.',
  keywords:
    'perfil ffv academy, preferências de aprendizado, base de conhecimento, conquistas, progresso',
};

/**
 * /perfil — duas ferramentas distintas, agora separadas com section headers
 * pra deixar claro que são funcionalidades diferentes:
 *
 *   1. Preferências de aprendizado (editável, persistido localStorage V1)
 *   2. Dev Card público (read-only, deriva do GameState)
 *
 * Antes da Onda 1E (2026-05-19), as 2 sections renderizavam coladas sem
 * separador, confundindo usuários sobre o que era cada coisa.
 */
export default function Page() {
  return (
    <div className="flex flex-col pb-20">
      <header
        className="px-5 md:px-8 pt-8 pb-2"
        style={{ borderBottom: '1px solid var(--ffv-border)' }}
      >
        <div className="max-w-4xl mx-auto">
          <p
            className="font-mono uppercase text-[11px] mb-2"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.14em', fontWeight: 700 }}
          >
            Sua conta na FFV
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontWeight: 700,
              fontSize: 'clamp(1.7rem, 3vw, 2.2rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 14,
            }}
          >
            Perfil
          </h1>
          <p
            className="text-sm max-w-2xl mb-6"
            style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}
          >
            Duas coisas vivem aqui: suas <strong>preferências de aprendizado</strong> (que
            usamos pra personalizar trilhas e revisão) e seu <strong>dev card público</strong>{' '}
            (que mostra suas conquistas).
          </p>
        </div>
      </header>

      <section
        aria-labelledby="prefs-section"
        className="px-5 md:px-8 pt-10"
      >
        <div className="max-w-4xl mx-auto">
          <h2
            id="prefs-section"
            className="font-mono uppercase text-[11px] mb-4"
            style={{ color: 'var(--ffv-amber, #b45309)', letterSpacing: '0.14em', fontWeight: 700 }}
          >
            1 · Preferências de aprendizado
          </h2>
          <ProfilePreferencesForm />
        </div>
      </section>

      <section
        aria-labelledby="dev-card-section"
        className="mt-12 pt-10"
        style={{ borderTop: '1px solid var(--ffv-border)' }}
      >
        <div className="px-5 md:px-8">
          <div className="max-w-4xl mx-auto mb-4">
            <h2
              id="dev-card-section"
              className="font-mono uppercase text-[11px]"
              style={{ color: 'var(--ffv-amber, #b45309)', letterSpacing: '0.14em', fontWeight: 700 }}
            >
              2 · Dev card público
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
              Suas conquistas, trilhas em progresso e estatísticas.
            </p>
          </div>
        </div>
        <DevProfileClient />
      </section>
    </div>
  );
}
