'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ExternalLink, ChevronDown } from 'lucide-react';
import { HUBS } from '@/lib/curriculum';
import { FfvLogo } from '@/components/ui/ffv-logo';

export interface FooterLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

interface SiteFooterProps {
  /** Substitui a coluna "Hubs". Default: HUBS de tecnologia. */
  hubLinks?: FooterLinkItem[];
  /** Substitui a coluna "Conteúdo". Default: News/Simulados/Progresso/etc (tech). */
  contentLinks?: FooterLinkItem[];
  /** Override do título da coluna de hubs (medvet usa "Hubs temáticos", etc). */
  hubColumnTitle?: string;
  /**
   * 3-4 links primários pra versão MOBILE compacta do footer.
   * Em telas <md o footer colapsa para mostrar só esses + "ver mais" que
   * expande o resto. Default: tech (Trilhas / News / Simulados / Ranking).
   */
  mobilePrimary?: FooterLinkItem[];
}

const DEFAULT_CONTENT_LINKS: FooterLinkItem[] = [
  { label: 'News', href: '/news' },
  { label: 'Simulados', href: '/simulados' },
  { label: 'Progresso', href: '/progresso' },
  { label: 'Revisar (SRS)', href: '/revisar' },
  { label: 'Glossário', href: '/glossario' },
  { label: 'Playlists', href: '/playlists' },
  { label: 'Roadmaps', href: '/roadmaps' },
];

// Sem fallback default — se a base não passou mobilePrimary, o footer
// mobile compacto não renderiza (cai direto pro layout completo). Isso evita
// vazar links de tech (ex.: /simulados) num footer medvet.

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.28 1.18-3.08-.12-.3-.51-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.6.23 2.77.12 3.07.73.8 1.17 1.82 1.17 3.08 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.86 3.38-1.86 3.61 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z"/>
    </svg>
  );
}

const AUTHOR_NAME = 'Fernando Franco Valle';
const AUTHOR_SITE = 'https://fernandofrancovalle.com';
const GITHUB_URL = 'https://github.com/feh-franc0';
const LINKEDIN_URL = 'https://www.linkedin.com/in/fernandofrancovalle/';
const CONTACT_MAIL = 'mailto:fernandofv1110@gmail.com';

const CURRENT_YEAR = new Date().getFullYear();

export function SiteFooter({
  hubLinks,
  contentLinks,
  hubColumnTitle = 'Hubs',
  mobilePrimary,
}: SiteFooterProps = {}) {
  const finalHubLinks: FooterLinkItem[] =
    hubLinks ?? HUBS.map(h => ({ label: h.name, href: h.href }));
  const finalContentLinks: FooterLinkItem[] = contentLinks ?? DEFAULT_CONTENT_LINKS;
  const finalMobilePrimary: FooterLinkItem[] | null = mobilePrimary ?? null;

  // Mobile: começa colapsado mostrando só os links primários da base. "Ver
  // mais" expande pro layout completo. Em desktop (md+) o estado é ignorado.
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const showMobileCompact = !mobileExpanded && finalMobilePrimary !== null;

  return (
    <footer
      className="mt-16"
      style={{
        borderTop: '1px solid var(--ffv-border)',
        background: 'var(--ffv-bg2)',
      }}
      aria-label="Rodapé do site"
    >
      {/* ── Mobile compact (md:hidden quando colapsado) ────────────────── */}
      {showMobileCompact && finalMobilePrimary && (
        <div className="md:hidden px-5 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" aria-label="FFV Academy" className="inline-flex">
              <FfvLogo size="sm" />
            </Link>
            <div className="flex items-center gap-2">
              <FooterIconLink href={GITHUB_URL} label="GitHub" icon={<GithubIcon size={14} />} external />
              <FooterIconLink href={LINKEDIN_URL} label="LinkedIn" icon={<LinkedinIcon size={14} />} external />
              <FooterIconLink href={CONTACT_MAIL} label="Email" icon={<Mail size={14} />} />
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-2 mb-4">
            {finalMobilePrimary.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block text-sm py-2 px-3 rounded-md transition-colors"
                  style={{
                    color: 'var(--foreground)',
                    background: 'var(--ffv-bg)',
                    border: '1px solid var(--ffv-border)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setMobileExpanded(true)}
            className="inline-flex items-center gap-1 text-xs font-mono uppercase"
            style={{
              color: 'var(--ffv-muted)',
              letterSpacing: '0.08em',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-expanded={mobileExpanded}
            data-testid="footer-mobile-expand"
          >
            Ver mais <ChevronDown size={12} strokeWidth={2.2} />
          </button>
        </div>
      )}

      {/* ── Layout completo (sempre em md+; em mobile aparece quando o usuário
              clica "Ver mais" OU quando a base não definiu mobilePrimary). ── */}
      <div className={showMobileCompact ? 'hidden md:block' : 'block'}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-12">
        {/* Brand + description */}
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:gap-10">
          <div>
            <Link href="/" className="inline-flex mb-3" aria-label="FFV Academy">
              <FfvLogo size="md" />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--ffv-muted)' }}>
              Escola de engenharia para a era da IA. Zero hype, arquitetura real, sem cadastro.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <FooterIconLink href={GITHUB_URL} label="GitHub" icon={<GithubIcon size={16} />} external />
              <FooterIconLink href={LINKEDIN_URL} label="LinkedIn" icon={<LinkedinIcon size={16} />} external />
              <FooterIconLink href={CONTACT_MAIL} label="Email" icon={<Mail size={16} />} />
            </div>
          </div>

          <FooterColumn title={hubColumnTitle}>
            {finalHubLinks.map(h => (
              <FooterLink key={h.href} href={h.href} external={h.external}>
                {h.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Conteúdo">
            {finalContentLinks.map(c => (
              <FooterLink key={c.href} href={c.href} external={c.external}>
                {c.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Sobre">
            <FooterLink href="/preferencias">Preferências</FooterLink>
            <FooterLink href="/verificar">Verificar certificado</FooterLink>
            <FooterLink href={AUTHOR_SITE} external>Site do autor</FooterLink>
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-10 pt-6 text-xs"
          style={{
            borderTop: '1px solid var(--ffv-border)',
            color: 'var(--ffv-muted)',
          }}
        >
          <p>
            © {CURRENT_YEAR} {AUTHOR_NAME}. Conteúdo editorial gratuito, sem cadastro.
          </p>
          <p className="flex items-center gap-1.5 font-mono">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--ffv-green)' }}
              aria-hidden
            />
            <span>Dados 100% no seu dispositivo · LGPD-ok</span>
          </p>
        </div>
      </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3
        className="font-mono uppercase mb-3"
        style={{
          fontSize: 11,
          color: 'var(--foreground)',
          letterSpacing: '0.14em',
          fontWeight: 700,
        }}
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const isExternal = external ?? /^(https?:|mailto:)/.test(href);
  if (isExternal) {
    return (
      <li>
        <a
          href={href}
          target={href.startsWith('mailto:') ? undefined : '_blank'}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'var(--ffv-muted)', textDecoration: 'none' }}
        >
          {children}
          <ExternalLink size={11} strokeWidth={2} style={{ opacity: 0.6 }} />
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className="text-sm transition-colors"
        style={{ color: 'var(--ffv-muted)', textDecoration: 'none' }}
      >
        {children}
      </Link>
    </li>
  );
}

function FooterIconLink({
  href,
  label,
  icon,
  external,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  const isExternal = external ?? /^(https?:|mailto:)/.test(href);
  return (
    <a
      href={href}
      target={isExternal && !href.startsWith('mailto:') ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={label}
      className="inline-flex items-center justify-center rounded-lg transition-colors"
      style={{
        width: 36,
        height: 36,
        background: 'var(--ffv-bg)',
        border: '1px solid var(--ffv-border)',
        color: 'var(--ffv-muted)',
        textDecoration: 'none',
      }}
    >
      {icon}
    </a>
  );
}
