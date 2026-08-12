'use client';

import Link from 'next/link';

const PATHS = [
  {
    icon: '🌱',
    title: 'Nunca estudei IA',
    desc: 'Comece pelos fundamentos — do conceito de IA até Transformers.',
    href: '/fundamentos-da-ia',
    cta: 'Começar do zero',
    color: '#58a6ff',
  },
  {
    icon: '⚡',
    title: 'Já sei o básico',
    desc: 'Pule direto para KV Cache, MoE e Tool Calling em produção.',
    href: '/ia-alem-do-llm',
    cta: 'IA Além do LLM',
    color: '#d2a8ff',
  },
  {
    icon: '◈',
    title: 'Quero colocar IA na AWS',
    desc: 'Bedrock, Knowledge Bases, agents e AgentCore — da primeira chamada à arquitetura em produção.',
    href: '/ia-aws',
    cta: 'IA na AWS',
    color: '#ff9900',
  },
  {
    icon: '🔧',
    title: 'Quero codar com IA',
    desc: 'Claude Code, Cursor, Codex — qual usar e quando.',
    href: '/ferramentas-ia-codigo',
    cta: 'Coding Agents',
    color: '#ffa657',
  },
  {
    icon: '☁️',
    title: 'Quero certificação AWS',
    desc: 'Cloud Practitioner, AI Practitioner, Developer e Solutions Architect.',
    href: '/aws-cloud-practitioner',
    cta: 'Certificações AWS',
    color: '#ff9900',
  },
  {
    icon: '🏗️',
    title: 'Quero botar IA em produção',
    desc: 'MLOps, distribuídos, observabilidade e security — operar IA de verdade.',
    href: '/engenharia',
    cta: 'Engenharia de Produção',
    color: '#e3b341',
  },
];

export function ComecarAqui({ hidden = false }: { hidden?: boolean }) {
  if (hidden) return null;
  return (
    <section className="px-6 py-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-6xl mx-auto">
        <p
          className="font-mono uppercase tracking-widest text-xs mb-3"
          style={{ color: 'var(--ffv-green)', letterSpacing: '0.12em' }}
        >
          Por onde começar
        </p>
        <h2
          style={{
            fontSize: 'var(--text-4xl-r)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          Escolha o caminho que faz sentido pra você
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--ffv-muted)',
            maxWidth: 640,
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          Cada caminho leva a um conjunto diferente de habilidades. Você pode trocar a qualquer
          momento — todo o conteúdo fica disponível.
        </p>

        {/* A jornada é o caminho ORDENADO, e precisa estar a um clique da home:
            é a resposta a "por onde começo?", a consulta de maior intenção do
            domínio, e a única página que liga as 38 trilhas de uma URL só. */}
        <Link
          href="/jornada"
          className="inline-flex items-center gap-2 mb-10 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          Ou siga a jornada completa, em ordem: de zero a arquiteto de IA na AWS →
        </Link>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          {PATHS.map(p => (
            <Link
              key={p.href}
              href={p.href}
              className="group p-5 rounded-2xl flex flex-col gap-2 transition-all"
              style={{
                background: 'var(--ffv-bg2)',
                border: `1px solid ${p.color}25`,
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = `${p.color}80`;
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 24px 50px -24px ${p.color}66`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = `${p.color}25`;
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="font-bold text-base">{p.title}</span>
              <span className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                {p.desc}
              </span>
              <span className="text-sm font-bold mt-auto pt-3 ffv-acento-texto" style={{ '--ffv-acento': p.color } as React.CSSProperties}>
                {p.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
