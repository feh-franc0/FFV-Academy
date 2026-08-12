import Link from 'next/link';
import { BrainCircuit, Mail, ExternalLink } from 'lucide-react';
// Módulo estreito — ver a nota em GameHUD.tsx.
import { HUBS } from '@/lib/curriculum/hubs';

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

export function SiteFooter() {
  return (
    <footer
      className="mt-16"
      style={{
        borderTop: '1px solid var(--ffv-border)',
        background: 'var(--ffv-bg2)',
      }}
      aria-label="Rodapé do site"
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-12">
        {/* Brand + description */}
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:gap-10">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-bold mb-3"
              style={{ color: 'var(--foreground)', fontSize: 16 }}
            >
              <BrainCircuit size={20} strokeWidth={1.8} style={{ color: 'var(--ffv-blue)' }} />
              <span>FFV</span>
              <span style={{ color: 'var(--ffv-blue)', fontWeight: 400 }}>Academy</span>
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

          <FooterColumn title="Hubs">
            {HUBS.map(h => (
              <FooterLink key={h.href} href={h.href}>{h.name}</FooterLink>
            ))}
          </FooterColumn>

          {/*
            Colunas reorganizadas: /sobre, /newsletter e /cheatsheets existiam e
            NENHUM link da plataforma apontava para elas — só eram alcançáveis
            digitando a URL. /comunidade e /mapa só tinham entrada indireta.
            Descoberta de página de produto não pode depender de sorte.
          */}
          <FooterColumn title="Estudar">
            {/*
              `/perguntas` e `/temas` entram aqui porque sem link no rodapé eles
              são órfãos: alcançáveis só pelo sitemap. `/temas` também recebe link
              dos 415 módulos pelos chips de tema; `/perguntas` não tinha nenhum
              link de entrada quando foi criada.
            */}
            <FooterLink href="/perguntas">Perguntas respondidas</FooterLink>
            <FooterLink href="/temas">Temas</FooterLink>
            <FooterLink href="/explorar">Explorar trilhas</FooterLink>
            <FooterLink href="/mapa">Mapa de trilhas</FooterLink>
            <FooterLink href="/roadmaps">Roadmaps</FooterLink>
            <FooterLink href="/playlists">Playlists</FooterLink>
            <FooterLink href="/cheatsheets">Cheatsheets</FooterLink>
            <FooterLink href="/glossario">Glossário</FooterLink>
          </FooterColumn>

          <FooterColumn title="Seu progresso">
            <FooterLink href="/progresso">Progresso</FooterLink>
            <FooterLink href="/revisar">Revisar (SRS)</FooterLink>
            <FooterLink href="/simulados">Simulados</FooterLink>
            <FooterLink href="/ranking">Ranking</FooterLink>
            <FooterLink href="/verificar">Verificar certificado</FooterLink>
            <FooterLink href="/preferencias">Preferências</FooterLink>
          </FooterColumn>

          <FooterColumn title="A escola">
            <FooterLink href="/sobre">Sobre a FFV</FooterLink>
            <FooterLink href="/comunidade">Comunidade</FooterLink>
            <FooterLink href="/news">News</FooterLink>
            <FooterLink href="/newsletter">Newsletter</FooterLink>
            <FooterLink href="/privacidade">Privacidade</FooterLink>
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
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  // Rótulo de agrupamento, não título de seção — o rodapé aparece em TODA
  // página, e 4 `<h3>` por página (um por coluna) quebrava a ordem de
  // heading sempre que a página não tinha `<h2>` entre o `<h1>` e o rodapé
  // (h1 → h3 pula nível). `<p>` mantém a mesma aparência sem entrar na
  // árvore de headings.
  return (
    <div>
      <p
        className="font-mono uppercase mb-3"
        style={{
          fontSize: 11,
          color: 'var(--foreground)',
          letterSpacing: '0.14em',
          fontWeight: 700,
        }}
      >
        {title}
      </p>
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

  /**
   * `min-height: 24px` + padding vertical para cumprir WCAG 2.5.8 (Target Size
   * mínimo). Antes era só `text-sm` sem padding: 17px de altura. Como o footer
   * aparece em TODA página e tem ~18 links, era a maior fonte de alvo de toque
   * subdimensionado da plataforma — 7 ocorrências por página, em todas elas.
   *
   * `inline-flex` em vez de inline para que a altura mínima valha; o <li> segue
   * sendo o item de lista, então a semântica não muda.
   */
  const alvo = 'inline-flex items-center gap-1 py-1 text-sm transition-colors min-h-[24px]';

  if (isExternal) {
    return (
      <li>
        <a
          href={href}
          target={href.startsWith('mailto:') ? undefined : '_blank'}
          rel="noopener noreferrer"
          className={alvo}
          style={{ color: 'var(--ffv-muted)', textDecoration: 'none' }}
        >
          {children}
          <ExternalLink size={11} strokeWidth={2} style={{ opacity: 0.6 }} aria-hidden="true" />
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className={alvo}
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
