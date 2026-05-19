import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre — FFV Academy',
  description:
    'Por que a FFV Academy existe: transformar conteúdo de estudo em uma jornada real e organizada — para qualquer área.',
  alternates: { canonical: 'https://fernandofrancovalle.com/sobre' },
};

// Tokens locais alinhados ao LandingClient (editorial premium).
const SERIF = 'var(--font-serif), Georgia, serif';
const SANS = 'var(--font-inter), system-ui, sans-serif';

export default function SobrePage() {
  return (
    <div style={{ background: 'var(--ffv-paper)', color: 'var(--ffv-ink)' }}>
      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section
        className="px-6 lg:px-10 relative overflow-hidden"
        style={{
          paddingTop: 'clamp(120px, 14vw, 168px)',
          paddingBottom: 'clamp(48px, 6vw, 80px)',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 50% at 80% 0%, color-mix(in srgb, var(--ffv-amber) 10%, transparent) 0%, transparent 65%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span
              style={{
                height: 1,
                width: 32,
                background: 'var(--ffv-amber)',
                display: 'inline-block',
              }}
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

          <h1
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
            Estudar bem não deveria depender de{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: 'var(--ffv-amber)',
                fontWeight: 700,
              }}
            >
              materiais soltos e bagunçados.
            </em>
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

      {/* ─── O que construímos ─────────────────────────────────────────── */}
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
          <div
            style={{
              fontFamily: SANS,
              fontSize: '1.05rem',
              color: '#44403c',
              lineHeight: 1.75,
            }}
            className="space-y-5"
          >
            <p>
              Uma plataforma de educação personalizada pra{' '}
              <em style={{ fontFamily: SERIF, fontStyle: 'italic', color: 'var(--ffv-ink)' }}>
                qualquer
              </em>{' '}
              área de estudo. Você conta o que está estudando — uma matéria da faculdade, um
              capítulo de cálculo, uma prova de constitucional, um conteúdo de AWS, um edital de
              concurso — e entregamos uma jornada de aprendizado feita sob medida.
            </p>
            <p>
              Não é um chatbot. Não é um gerador de texto. É uma trilha com módulos sequenciais,
              exercícios, exemplos práticos e revisão espaçada, montada a partir do{' '}
              <strong style={{ color: 'var(--ffv-ink)', fontWeight: 600 }}>seu objetivo</strong>{' '}
              e dos seus materiais.
            </p>
            <p>
              Funciona pra estudantes de medicina, veterinária, engenharia, direito, design,
              administração, saúde, tecnologia, concursos — qualquer área. Em PT-BR, gratuito
              enquanto crescemos, sem paywall de conteúdo.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Princípios ────────────────────────────────────────────────── */}
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

          <div className="grid sm:grid-cols-2 gap-5">
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

      {/* ─── CTA final ─────────────────────────────────────────────────── */}
      <section
        className="px-6 lg:px-10 relative overflow-hidden"
        style={{
          paddingTop: 'clamp(72px, 10vw, 120px)',
          paddingBottom: 'clamp(72px, 10vw, 120px)',
          borderTop: '1px solid var(--ffv-border)',
        }}
      >
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
            Pronto pra estudar com{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--ffv-amber)' }}>
              uma jornada feita pra você?
            </em>
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
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-semibold transition-all"
              style={{
                fontFamily: SANS,
                background: 'var(--ffv-ink)',
                color: '#fff',
                borderRadius: 10,
                letterSpacing: '-0.005em',
                boxShadow: '0 10px 28px -8px rgba(28,25,23,0.4)',
              }}
            >
              Criar minha jornada
              <span aria-hidden style={{ fontSize: 12 }}>→</span>
            </Link>
            <Link
              href="/bases"
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-semibold transition-colors"
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
    <article
      className="p-7"
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
    </article>
  );
}
