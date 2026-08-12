'use client';

export function ComunidadeAutor() {
  return (
    <section className="px-6 py-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Visão / Autor */}
        <article
          className="p-8 rounded-2xl"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
          }}
        >
          <p
            className="font-mono uppercase tracking-widest text-xs mb-3"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.12em' }}
          >
            Nossa proposta
          </p>
          <h3 className="font-bold text-xl mb-4" style={{ lineHeight: 1.3 }}>
            Formar os engenheiros da era da IA —{' '}
            <span style={{ color: 'var(--ffv-blue)' }}>de graça, sem hype.</span>
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--ffv-muted)', lineHeight: 1.75 }}>
            A gente acredita numa coisa simples: na era da IA, quem entende como as coisas funcionam
            por dentro sai na frente de quem só copia e cola de chatbot. Enquanto o mercado vende
            curso de &ldquo;ganhe dinheiro com ChatGPT&rdquo;, aqui você aprende a construir de verdade.
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--ffv-muted)', lineHeight: 1.75 }}>
            O foco é claro: <strong style={{ color: 'var(--foreground)' }}>Claude &amp; Anthropic no
            centro</strong>, IA aplicada (RAG, agents, evals), AWS em produção e a engenharia que
            sustenta tudo isso. Do primeiro &ldquo;o que é um token&rdquo; até o seu agente rodando em
            produção — em trilhas ordenadas, gamificadas e 100% em português.
          </p>
          <div className="flex flex-wrap gap-2">
            <Tag>Feito por dev brasileiro 🇧🇷</Tag>
            <Tag>Atualizado toda semana</Tag>
            <Tag>Sem hype</Tag>
            <Tag>100% gratuito</Tag>
          </div>
        </article>

        {/* Newsletter / Comunidade */}
        <article
          className="p-8 rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, var(--ffv-bg2), color-mix(in srgb, var(--ffv-blue) 8%, var(--ffv-bg2)))',
            border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
          }}
        >
          <p
            className="font-mono uppercase tracking-widest text-xs mb-3"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
          >
            Faça parte
          </p>
          <h3 className="font-bold text-xl mb-3">Aqui você não estuda sozinho.</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)', lineHeight: 1.7 }}>
            Toda semana entram mais devs aprendendo a construir com IA de verdade. Você ganha XP
            junto, disputa o ranking, mantém a streak e caminha lado a lado com quem está na mesma
            jornada. A newsletter traz um artigo profundo por semana; o Discord da comunidade está
            chegando. Sem spam — só o que importa.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <a
              href="https://buttondown.com/fernandofrancovalle"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                background: 'var(--ffv-blue)',
                color: 'var(--primary-foreground)',
              }}
            >
              Assinar newsletter →
            </a>
            <span
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
              style={{
                background: 'transparent',
                border: '1px dashed var(--ffv-border)',
                color: 'var(--ffv-muted)',
              }}
              title="Comunidade Discord chegando em breve"
            >
              💬 Discord (em breve)
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[11px] font-mono px-2.5 py-1 rounded-full"
      style={{
        background: 'var(--ffv-bg)',
        border: '1px solid var(--ffv-border)',
        color: 'var(--ffv-muted)',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </span>
  );
}
