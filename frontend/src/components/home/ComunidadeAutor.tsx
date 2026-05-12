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
            Por que essa plataforma existe
          </p>
          <h3 className="font-bold text-xl mb-4">
            Tecnologia só faz sentido quando vira{' '}
            <span style={{ color: 'var(--ffv-blue)' }}>produto que entrega valor.</span>
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--ffv-muted)', lineHeight: 1.75 }}>
            Esse é o foco daqui. Nada de aprender frameworks pelo framework, nada de stack pela stack —
            tudo é meio para construir produtos digitais que pessoas usam de verdade. A nova era da IA
            não substitui essa lógica: ela exponencia. Quem entende isso primeiro sai na frente.
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--ffv-muted)', lineHeight: 1.75 }}>
            FFV Academy ensina o que importa para construir, lançar e evoluir produtos digitais com IA
            no centro: dos fundamentos técnicos à comunicação, da AWS ao marketing, da arquitetura ao
            empreendedorismo digital. Tudo conectado, tudo gratuito, tudo em PT-BR.
          </p>
          <div className="flex flex-wrap gap-2">
            <Tag>Construído por dev brasileiro 🇧🇷</Tag>
            <Tag>Atualizado toda semana</Tag>
            <Tag>Sem hype</Tag>
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
            Acompanhe a evolução
          </p>
          <h3 className="font-bold text-xl mb-3">Newsletter semanal direta na caixa</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)', lineHeight: 1.7 }}>
            Um artigo profundo por semana sobre IA, engenharia, AWS e produtos digitais. Atualizações
            de novas trilhas, frameworks e tendências do mercado. Sem spam, sem promoção — só conteúdo
            que importa.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <a
              href="https://buttondown.com/fernandofrancovalle"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                background: 'var(--ffv-blue)',
                color: '#0d1117',
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
