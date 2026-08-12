import type { Metadata } from 'next';
import Link from 'next/link';
import { CURRICULUM, HUBS } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Quem está por trás da FFV Academy e por que essa plataforma existe: tecnologia só faz sentido quando vira produto que entrega valor.';

export const metadata: Metadata = {
  title: 'Sobre',
  description: DESCRICAO_CARTAO,
  alternates: { canonical: `${BASE}/sobre` },
  ...social({ titulo: `Sobre — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/sobre' }),
};

const TOTAL_MODULES = CURRICULUM.flatMap(t => t.modules).length;

export default function SobrePage() {
  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 0%, color-mix(in srgb, var(--ffv-blue) 14%, transparent) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-mono mb-6 transition-opacity hover:opacity-70"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
          >
            ← VOLTAR PARA HOME
          </Link>
          <p
            className="font-mono uppercase tracking-widest text-xs mb-3"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.12em' }}
          >
            Sobre a plataforma
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Tecnologia só faz sentido quando vira{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              produto que entrega valor.
            </span>
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'var(--ffv-muted)', maxWidth: 700 }}
          >
            FFV Academy nasceu da convicção de que aprender tecnologia sem propósito é desperdício de
            energia. Cada trilha aqui foi pensada para responder uma pergunta simples: como isso me
            ajuda a construir algo que pessoas usam de verdade?
          </p>
        </div>
      </section>

      <section className="px-6 py-16" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="font-bold mb-6"
            style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', letterSpacing: '-0.02em' }}
          >
            O que motivou criar isso
          </h2>
          <div className="space-y-5 text-base" style={{ color: 'var(--ffv-muted)', lineHeight: 1.8 }}>
            <p>
              Nos últimos anos, a forma como construímos software mudou mais do que nas duas décadas
              anteriores. IA não substituiu o desenvolvedor — mas exponenciou quem entendeu a usar.
              O problema é que a maior parte do conteúdo educacional brasileiro ainda ensina como em
              2015: framework pelo framework, sintaxe pela sintaxe.
            </p>
            <p>
              FFV Academy é minha resposta a isso. Cada trilha aqui ensina o que importa para
              construir, lançar e evoluir produtos digitais com IA no centro: dos fundamentos
              técnicos à comunicação, da AWS ao marketing, da arquitetura ao empreendedorismo
              digital.
            </p>
            <p>
              Tudo conectado. Tudo gratuito. Tudo em PT-BR. Sem hype, sem atalho de marketing.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="font-bold mb-8"
            style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', letterSpacing: '-0.02em' }}
          >
            O que tem aqui hoje
          </h2>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
          >
            <StatCard label="Módulos publicados" value={`${TOTAL_MODULES}+`} accent="var(--ffv-blue)" />
            <StatCard label="Trilhas" value={`${CURRICULUM.length}`} accent="var(--ffv-purple)" />
            <StatCard label="Áreas (hubs)" value={`${HUBS.length}`} accent="#fbbf24" />
            <StatCard label="Custo" value="R$ 0" accent="var(--ffv-green)" />
          </div>
        </div>
      </section>

      <section className="px-6 py-16" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="font-bold mb-6"
            style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', letterSpacing: '-0.02em' }}
          >
            Como funciona o aprendizado aqui
          </h2>
          <div className="space-y-4">
            <Principle
              num="01"
              title="Profundidade real, não cobertura"
              desc="Prefiro ensinar uma coisa por dentro do que tocar 10 coisas por fora. Cada artigo é uma imersão técnica que você sai sabendo aplicar — não decorando."
            />
            <Principle
              num="02"
              title="Gamificação que reforça aprendizado"
              desc="XP, badges, streak e ranking não são vaidade — são mecanismos para você voltar amanhã. Aprender tecnologia exige consistência, e a gamificação ajuda a manter o ritmo."
            />
            <Principle
              num="03"
              title="Sem paywall, sem cadastro forçado"
              desc="Você pode estudar tudo aqui sem criar conta. O cadastro só serve para sincronizar progresso entre dispositivos e aparecer no ranking público. Conhecimento técnico não deveria ser produto premium."
            />
            <Principle
              num="04"
              title="Atualização contínua"
              desc="O mercado de IA muda toda semana. Cada artigo é revisitado quando o que ele descreve muda. Em vez de criar 100 cursos uma vez, mantenho 1 plataforma viva."
            />
          </div>
        </div>
      </section>

      <section
        className="px-6 py-20 relative overflow-hidden"
        style={{ borderTop: '1px solid var(--ffv-border)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="font-bold mb-5"
            style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Vamos construir{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              juntos.
            </span>
          </h2>
          <p
            className="mb-8"
            style={{
              color: 'var(--ffv-muted)',
              fontSize: 16,
              maxWidth: 480,
              margin: '0 auto 32px',
              lineHeight: 1.7,
            }}
          >
            Comece pela trilha que mais te interessa. Em poucas semanas você vai estar construindo
            coisas que antes pareciam impossíveis.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-transform hover:scale-[1.04]"
              style={{
                background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                color: 'var(--primary-foreground)',
                boxShadow: '0 16px 40px -12px color-mix(in srgb, var(--ffv-blue) 50%, transparent)',
              }}
            >
              Ver o mapa de trilhas →
            </Link>
            <Link
              href="/comunidade"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors"
              style={{
                background: 'transparent',
                border: '1px solid var(--ffv-border)',
                color: 'var(--foreground)',
              }}
            >
              Comunidade
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="rounded-2xl p-5 text-center"
      style={{
        background: 'var(--ffv-bg2)',
        border: `1px solid ${accent}30`,
      }}
    >
      <p className="font-mono text-3xl md:text-4xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      <p
        className="font-mono text-[10px] mt-2"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.08em' }}
      >
        {label.toUpperCase()}
      </p>
    </div>
  );
}

function Principle({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div
      className="rounded-2xl p-6 flex gap-5 items-start"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
      }}
    >
      <span
        className="font-mono font-bold text-3xl flex-shrink-0"
        style={{
          // Era `color-mix(… var(--ffv-blue) 60%, var(--ffv-bg))`, que mistura o
          // azul COM O FUNDO — apagar o texto de propósito, 2,62:1. O número é o
          // conteúdo da seção; quem quer suavizar suaviza o rótulo, não o dado.
          color: 'var(--ffv-blue)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {num}
      </span>
      <div>
        <h3 className="font-bold text-base mb-2">{title}</h3>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.7 }}>
          {desc}
        </p>
      </div>
    </div>
  );
}
