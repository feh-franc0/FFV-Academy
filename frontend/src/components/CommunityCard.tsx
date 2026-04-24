'use client';

/**
 * Card de comunidade — Discord/Telegram + redes sociais.
 *
 * NOTA: os links de Discord/Telegram estão como placeholders (#).
 * Quando criar os canais reais, substituir os href.
 */

interface CommunityCardProps {
  variant?: 'home' | 'footer';
}

const COMMUNITY_LINKS = {
  // TODO: substituir quando criar
  discord: '#discord-em-breve',
  telegram: '#telegram-em-breve',
  // Já existe
  newsletter: 'https://buttondown.com/fernandofrancovalle',
  twitter: 'https://twitter.com/feh_franc0',
  github: 'https://github.com/feh-franc0',
};

export function CommunityCard({ variant = 'home' }: CommunityCardProps) {
  if (variant === 'footer') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 py-4">
        <FooterLink href={COMMUNITY_LINKS.discord} label="Discord" icon="💬" disabled />
        <FooterLink href={COMMUNITY_LINKS.telegram} label="Telegram" icon="✈️" disabled />
        <FooterLink href={COMMUNITY_LINKS.newsletter} label="Newsletter" icon="📬" />
        <FooterLink href={COMMUNITY_LINKS.twitter} label="X / Twitter" icon="𝕏" />
        <FooterLink href={COMMUNITY_LINKS.github} label="GitHub" icon="</>" />
      </div>
    );
  }

  return (
    <section className="px-6 py-14" style={{ background: 'var(--ffv-bg)' }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-[10px] tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>
          Comunidade
        </p>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Estudar junto vai mais longe.</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--ffv-muted)' }}>
          Discuta projetos, tire dúvidas e veja o que outros devs estão construindo com IA.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <CommunityTile
            title="Discord (em breve)"
            desc="Servidor com canais por hub: IA, AWS, Claude Code, Engenharia. Live coding sessions."
            icon="💬"
            href={COMMUNITY_LINKS.discord}
            cta="Em breve"
            disabled
            color="#5865f2"
          />
          <CommunityTile
            title="Newsletter semanal"
            desc="Toda sexta: melhores artigos da semana, novidades do ecossistema, dica prática."
            icon="📬"
            href={COMMUNITY_LINKS.newsletter}
            cta="Inscrever grátis"
            color="var(--ffv-blue)"
          />
        </div>
      </div>
    </section>
  );
}

function CommunityTile({
  title,
  desc,
  icon,
  href,
  cta,
  color,
  disabled,
}: {
  title: string;
  desc: string;
  icon: string;
  href: string;
  cta: string;
  color: string;
  disabled?: boolean;
}) {
  const isDisabled = !!disabled;
  const Wrapper = isDisabled
    ? ({ children }: { children: React.ReactNode }) => <div>{children}</div>
    : ({ children }: { children: React.ReactNode }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {children}
        </a>
      );

  return (
    <Wrapper>
      <div
        className={`rounded-2xl p-5 transition-all ${isDisabled ? 'opacity-70' : 'hover:scale-[1.01] cursor-pointer'}`}
        style={{
          background: 'var(--ffv-bg2)',
          border: `1px solid ${color}30`,
        }}
      >
        <div className="flex items-start gap-4">
          <span style={{ fontSize: 28 }}>{icon}</span>
          <div className="flex-1">
            <h3 className="text-base font-bold mb-1" style={{ color }}>
              {title}
            </h3>
            <p className="text-xs mb-3" style={{ color: 'var(--ffv-muted)' }}>
              {desc}
            </p>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: isDisabled ? 'var(--ffv-bg3)' : `${color}20`,
                color: isDisabled ? 'var(--ffv-muted)' : color,
                border: isDisabled ? '1px solid var(--ffv-border)' : `1px solid ${color}40`,
              }}
            >
              {cta} {!isDisabled && '→'}
            </span>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

function FooterLink({ href, label, icon, disabled }: { href: string; label: string; icon: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full opacity-50"
        style={{ color: 'var(--ffv-muted)', border: '1px solid var(--ffv-border)' }}
        title="Em breve"
      >
        <span aria-hidden style={{ fontWeight: 700 }}>{icon}</span>
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
      style={{ color: 'var(--ffv-muted)', border: '1px solid var(--ffv-border)' }}
    >
      <span aria-hidden style={{ fontWeight: 700 }}>{icon}</span>
      {label}
    </a>
  );
}
