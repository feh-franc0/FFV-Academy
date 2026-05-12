import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Comunidade — FFV Academy',
  description:
    'Newsletter semanal, Discord (em breve), redes sociais e como participar da comunidade FFV Academy.',
  alternates: { canonical: 'https://fernandofrancovalle.com/comunidade' },
};

const CHANNELS = [
  {
    icon: '📧',
    title: 'Newsletter semanal',
    desc: 'Um artigo profundo por semana sobre IA, engenharia e produtos digitais. Sem spam, cancele quando quiser.',
    href: 'https://buttondown.com/fernandofrancovalle',
    cta: 'Assinar →',
    color: 'var(--ffv-blue)',
    external: true,
    available: true,
  },
  {
    icon: '💬',
    title: 'Discord',
    desc: 'Servidor para tirar dúvidas, compartilhar projetos e encontrar duplas de estudo. Entre na lista de espera.',
    href: 'https://buttondown.com/fernandofrancovalle',
    cta: 'Entrar na lista →',
    color: '#5865f2',
    external: true,
    available: true,
  },
  {
    icon: '🐦',
    title: 'Twitter/X',
    desc: 'Threads técnicos, atualizações da plataforma e debate sobre IA e engenharia.',
    href: 'https://twitter.com/feh_franc0',
    cta: 'Seguir →',
    color: '#1da1f2',
    external: true,
    available: true,
  },
  {
    icon: '💼',
    title: 'LinkedIn',
    desc: 'Posts profissionais sobre carreira em tecnologia, IA e construção de produtos digitais.',
    href: 'https://www.linkedin.com/in/fehfranco/',
    cta: 'Conectar →',
    color: '#0a66c2',
    external: true,
    available: true,
  },
  {
    icon: '🐙',
    title: 'GitHub',
    desc: 'Código aberto e bibliotecas que dão suporte à plataforma. Issues e PRs são bem-vindos.',
    href: 'https://github.com/feh-franc0',
    cta: 'Repositórios →',
    color: 'var(--foreground)',
    external: true,
    available: true,
  },
  {
    icon: '🎬',
    title: 'YouTube',
    desc: 'Tutoriais em vídeo dos artigos mais populares. Inscreva-se para ser notificado quando o primeiro vídeo sair.',
    href: 'https://buttondown.com/fernandofrancovalle',
    cta: 'Ser avisado →',
    color: '#ff0000',
    external: true,
    available: true,
  },
];

export default function ComunidadePage() {
  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--ffv-blue) 14%, transparent) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-mono mb-6 transition-opacity hover:opacity-70"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
          >
            ← VOLTAR PARA HOME
          </Link>
          <p
            className="font-mono uppercase tracking-widest text-xs mb-3"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
          >
            Comunidade
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Estudar junto é mais rápido.
          </h1>
          <p
            style={{
              fontSize: 16,
              color: 'var(--ffv-muted)',
              maxWidth: 640,
              lineHeight: 1.7,
            }}
          >
            FFV Academy não é só conteúdo — é uma comunidade de devs brasileiros se preparando para a
            nova era da IA. Newsletter, Discord, redes sociais. Escolha onde quer interagir.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-5xl mx-auto pt-12">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            {CHANNELS.map(c => (
              <ChannelCard key={c.title} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* Como participar */}
      <section className="px-6 pb-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-5xl mx-auto pt-12">
          <p
            className="font-mono uppercase tracking-widest text-xs mb-3"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
          >
            Como participar
          </p>
          <h2 className="text-2xl font-bold mb-8">
            Contribua com a comunidade
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: '✍️',
                title: 'Sugira um artigo',
                desc: 'Tem um tema técnico que quer ver aqui? Mande o título e por que ele importa.',
                href: 'mailto:fernandofv1110@gmail.com?subject=Sugestão de artigo para FFV Academy&body=Tema:%0A%0APor que importa:%0A',
                cta: 'Enviar sugestão →',
                color: 'var(--ffv-blue)',
              },
              {
                icon: '🐛',
                title: 'Reporte um erro',
                desc: 'Encontrou imprecisão técnica, link quebrado ou typo? Seu feedback melhora a plataforma.',
                href: 'mailto:fernandofv1110@gmail.com?subject=Erro encontrado na FFV Academy&body=Página:%0A%0AErro encontrado:%0A',
                cta: 'Reportar →',
                color: 'var(--ffv-red)',
              },
              {
                icon: '📢',
                title: 'Compartilhe o projeto',
                desc: 'Se o conteúdo te ajudou, compartilhe com um colega dev. Crescimento orgânico é o único que funciona.',
                href: 'https://twitter.com/intent/tweet?text=Estou estudando IA e engenharia de software na FFV Academy — conteúdo técnico de verdade, gratuito e gamificado 🎯 https://fernandofrancovalle.com via @feh_franc0',
                cta: 'Compartilhar no X →',
                color: '#1da1f2',
              },
            ].map(item => (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="p-6 rounded-2xl flex flex-col gap-3 transition-all hover:opacity-90"
                style={{
                  background: 'var(--ffv-bg2)',
                  border: `1px solid ${item.color}25`,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm flex-1" style={{ color: 'var(--ffv-muted)', lineHeight: 1.65 }}>{item.desc}</p>
                <span className="text-sm font-bold mt-auto pt-2" style={{ color: item.color }}>{item.cta}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ChannelCard({
  icon,
  title,
  desc,
  href,
  cta,
  color,
  external,
  available,
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  color: string;
  external: boolean;
  available: boolean;
}) {
  const Tag = available && external ? 'a' : 'div';
  const props = available && external
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Tag
      {...props}
      className="group p-6 rounded-2xl flex flex-col gap-3 transition-all"
      style={{
        background: 'var(--ffv-bg2)',
        border: `1px solid ${color}25`,
        opacity: available ? 1 : 0.6,
        cursor: available ? 'pointer' : 'default',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span style={{ fontSize: 32 }}>{icon}</span>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.65 }}>
        {desc}
      </p>
      <span
        className="text-sm font-bold mt-auto pt-2"
        style={{ color: available ? color : 'var(--ffv-muted)' }}
      >
        {cta}
      </span>
    </Tag>
  );
}
