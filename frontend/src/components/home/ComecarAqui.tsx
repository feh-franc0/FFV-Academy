'use client';

import Link from 'next/link';

export interface ComecarPath {
  icon: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  color: string;
}

const TECH_PATHS: ComecarPath[] = [
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
    desc: 'Cloud Practitioner, Developer e Solutions Architect.',
    href: '/aws-cloud-practitioner',
    cta: 'AWS Cloud',
    color: '#ff9900',
  },
  {
    icon: '🏗️',
    title: 'Quero virar sênior',
    desc: 'DevOps, distribuídos, observabilidade — engenheiro de sistemas.',
    href: '/engenharia',
    cta: 'Engenharia',
    color: '#e3b341',
  },
  {
    icon: '🎤',
    title: 'Quero crescer no digital',
    desc: 'Comunicação, carreira, conteúdo, marketing, empreendedorismo.',
    href: '/aprenda/comunicacao-falar-em-publico',
    cta: 'Profissional Digital',
    color: '#f472b6',
  },
];

interface Props {
  hidden?: boolean;
  paths?: ComecarPath[];
  heading?: string;
  subheading?: string;
}

export function ComecarAqui({ hidden = false, paths, heading, subheading }: Props) {
  if (hidden) return null;

  const finalPaths = paths ?? TECH_PATHS;
  const finalHeading = heading ?? 'Escolha o caminho que faz sentido pra você';
  const finalSubheading =
    subheading ??
    'Cada caminho leva a um conjunto diferente de habilidades. Você pode trocar a qualquer momento — todo o conteúdo fica disponível.';

  return (
    <section
      id="comecar-aqui"
      className="px-6 py-20"
      style={{ borderTop: '1px solid var(--ffv-border)' }}
    >
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
          {finalHeading}
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
          {finalSubheading}
        </p>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          {finalPaths.map(p => (
            <Link
              key={p.href + p.title}
              href={p.href}
              className="group p-5 rounded-2xl flex flex-col gap-2 transition-all"
              style={{
                background: 'var(--ffv-bg2)',
                border: `1px solid ${p.color}25`,
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = `${p.color}80`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = `${p.color}25`;
                e.currentTarget.style.transform = '';
              }}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="font-bold text-base">{p.title}</span>
              <span className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                {p.desc}
              </span>
              <span className="text-sm font-bold mt-auto pt-3" style={{ color: p.color }}>
                {p.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
