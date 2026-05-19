'use client';

import Link from 'next/link';

// LandingFooter — footer editorial alinhado à landing page (cream + ink + amber).
// Minimal: wordmark grande, 3 colunas curtas de links, social, copyright.
// Inspirado em Anthropic / Stripe / Linear (footer com presença, sem poluição).

const SERIF = 'var(--font-serif), Georgia, serif';
const SANS = 'var(--font-inter), system-ui, sans-serif';

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Bases de conhecimento', href: '/bases' },
      { label: 'Base de Tecnologia',    href: '/tecnologia' },
      { label: 'Criar minha jornada',   href: '/#solicitar-base' },
    ],
  },
  {
    title: 'Sobre',
    links: [
      { label: 'O projeto',  href: '/sobre' },
      { label: 'Comunidade', href: '/comunidade' },
      { label: 'Newsletter', href: '/newsletter' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidade · LGPD', href: '/sobre#privacidade' },
      { label: 'Termos de uso',      href: '/sobre#termos' },
      { label: 'Contato',            href: 'mailto:oi@fernandofrancovalle.com', external: true },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer
      style={{
        background: 'var(--ffv-paper)',
        color: 'var(--ffv-ink)',
        borderTop: '1px solid var(--ffv-ink)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-[1.4fr,2fr] gap-12 lg:gap-20 mb-14 lg:mb-16">
          {/* ── Brand block ──────────────────────────────── */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-5"
              style={{ textDecoration: 'none' }}
              aria-label="FFV Academy — voltar para a home"
            >
              <FooterLogo />
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: '-0.022em',
                  color: 'var(--ffv-ink)',
                  lineHeight: 1,
                }}
              >
                FFV{' '}
                <em
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: 'var(--ffv-muted)',
                  }}
                >
                  Academy
                </em>
              </span>
            </Link>

            <p
              style={{
                fontFamily: SANS,
                fontSize: 15,
                color: '#44403c',
                lineHeight: 1.6,
                maxWidth: 360,
                marginBottom: 24,
              }}
            >
              Plataforma de estudo personalizada — qualquer área, em 24 horas. No mesmo padrão da
              nossa base de Tecnologia, com curadoria humana e revisão espaçada.
            </p>

            <div className="flex items-center gap-2">
              <SocialLink
                href="https://github.com/feh-franc0"
                label="GitHub"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M8 .2A8 8 0 0 0 .2 8a8 8 0 0 0 5.4 7.6c.4.1.6-.2.6-.4v-1.4c-2.2.5-2.7-1-2.7-1-.3-.9-.9-1.1-.9-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.8-.2-3.7-.9-3.7-4 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.7 7.7 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.6v2.3c0 .2.1.5.6.4A8 8 0 0 0 15.8 8 8 8 0 0 0 8 .2Z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/in/fehfranco/"
                label="LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M13.6 13.6h-2.4v-3.7c0-.9 0-2-1.3-2s-1.5.9-1.5 1.9v3.8H6V6h2.3v1c.3-.6 1.1-1.2 2.3-1.2 2.4 0 2.9 1.6 2.9 3.7v4ZM3.3 5C2.5 5 1.9 4.4 1.9 3.6S2.5 2.3 3.3 2.3s1.4.6 1.4 1.3S4 5 3.3 5Zm1.2 8.6H2.1V6h2.4v7.6ZM14.8 0H1.2C.5 0 0 .5 0 1.2v13.6c0 .7.5 1.2 1.2 1.2h13.6c.7 0 1.2-.5 1.2-1.2V1.2c0-.7-.5-1.2-1.2-1.2Z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://twitter.com/feh_franc0"
                label="Twitter / X"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                  <path d="M10.7 0H13l-5 5.7L14 14H9.3L5.7 9.2 1.5 14H0L5.4 8 0 0h4.8l3.3 4.4L11 0Zm-.8 12.6h1.2L4 1.3H2.7l7.2 11.3Z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="mailto:oi@fernandofrancovalle.com"
                label="E-mail"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M14.5 2.5h-13c-.6 0-1 .4-1 1v9c0 .6.4 1 1 1h13c.6 0 1-.4 1-1v-9c0-.6-.4-1-1-1Zm-1 1L8 7.5 2.5 3.5h11Zm-12 9V4.4l6.4 4.4c.2.1.4.1.6 0L14.5 4.4v8.1h-13Z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* ── Columns ──────────────────────────────────── */}
          <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
            {COLUMNS.map(col => (
              <div key={col.title}>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--ffv-amber)',
                    marginBottom: 16,
                  }}
                >
                  {col.title}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map(link => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: SANS,
                            fontSize: 14,
                            color: 'var(--ffv-ink)',
                            fontWeight: 500,
                            textDecoration: 'none',
                            transition: 'color 200ms ease',
                          }}
                          onMouseOver={e => (e.currentTarget.style.color = 'var(--ffv-amber)')}
                          onMouseOut={e => (e.currentTarget.style.color = 'var(--ffv-ink)')}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          style={{
                            fontFamily: SANS,
                            fontSize: 14,
                            color: 'var(--ffv-ink)',
                            fontWeight: 500,
                            textDecoration: 'none',
                            transition: 'color 200ms ease',
                          }}
                          onMouseOver={e => (e.currentTarget.style.color = 'var(--ffv-amber)')}
                          onMouseOut={e => (e.currentTarget.style.color = 'var(--ffv-ink)')}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom row ─────────────────────────────────── */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 pt-8"
          style={{
            borderTop: '1px solid var(--ffv-border)',
            fontFamily: SANS,
            fontSize: 12,
            color: 'var(--ffv-muted)',
          }}
        >
          <p>
            © {new Date().getFullYear()} Fernando Franco Valle. Conteúdo editorial gratuito na V1.
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--ffv-sage)',
                }}
              />
              LGPD-ok · sem cookies de tracking
            </span>
            <span aria-hidden style={{ color: 'var(--ffv-border)' }}>·</span>
            <span>Feito no Brasil 🇧🇷</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 30 30" aria-hidden style={{ flexShrink: 0 }}>
      <rect x="0" y="0" width="30" height="30" rx="7" fill="var(--ffv-ink)" />
      <rect x="9" y="7"  width="3"  height="16" fill="#fbbf24" rx="1" />
      <rect x="9" y="7"  width="12" height="3"  fill="#fbbf24" rx="1" />
      <rect x="9" y="13" width="8"  height="3"  fill="#fbbf24" rx="1" />
    </svg>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        background: 'transparent',
        border: '1px solid var(--ffv-border)',
        color: 'var(--ffv-ink)',
        transition: 'all 200ms ease',
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = 'var(--ffv-ink)';
        e.currentTarget.style.color = '#fbbf24';
        e.currentTarget.style.borderColor = 'var(--ffv-ink)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--ffv-ink)';
        e.currentTarget.style.borderColor = 'var(--ffv-border)';
      }}
    >
      {children}
    </a>
  );
}
