'use client';

import Link from 'next/link';
// Renderiza na home — só usa .modules.length/.readTime/.xp de UMA trilha, que
// CURRICULO_LEVE carrega. `PILARES.desc` abaixo é prosa local, não vem do
// currículo — não confundir com `Module.desc`.
import { CURRICULO_LEVE } from '@/lib/curriculum/indice-leve';
import manifesto from '@/lib/content-manifest.json';

/**
 * Destaque da trilha AWS Bedrock na home.
 *
 * Todos os números vêm do conteúdo: módulos, leitura e XP do `CURRICULUM`;
 * diagramas do `content-manifest.json`, gerado a partir dos seeds. É o tipo de
 * texto que envelhece mal quando alguém escreve "29 diagramas" à mão — estava
 * assim até ago/2026, correto por coincidência e sem nada que avisasse no dia em
 * que a trilha crescesse. `src/tests/integration/content-manifest-fresco.test.ts`
 * falha se o manifesto sair de sincronia com os seeds.
 */

const ACCENT = '#ff9900';

const PILARES = [
  {
    icon: '🏛️',
    title: 'Arquitetura de referência',
    desc: 'As 7 camadas que uma empresa monta em volta do Bedrock — do AI gateway ao chargeback por squad.',
  },
  {
    icon: '🗺️',
    title: '106 serviços AWS mapeados',
    desc: 'Cada um com o que é, o que soma ao Bedrock, quando usar e o limite que decide a arquitetura.',
  },
  {
    icon: '✂️',
    title: '14 alavancas de custo',
    desc: 'Com economia típica, esforço e risco — na ordem certa de aplicar. Começando pelas que não custam nada.',
  },
  {
    icon: '🎧',
    title: 'Cases desenhados camada a camada',
    desc: 'Atendimento, documentos em setor regulado e copiloto interno: baseline, decisões, erros e a conta.',
  },
];

export function BedrockDestaque() {
  const trilha = CURRICULO_LEVE.find(t => t.id === 'trail-bedrock');
  if (!trilha) return null;

  const modulos = trilha.modules.length;
  const minutos = trilha.modules.reduce((acc, m) => acc + (m.readTime ?? 0), 0);
  const xp = trilha.modules.reduce((acc, m) => acc + (m.xp ?? 0), 0);
  const horas = Math.floor(minutos / 60);

  const estatisticas = (manifesto.porTrilha as Record<
    string,
    { modulos: number; diagramas: number; quizzes: number } | undefined
  >)['trail-bedrock'];

  const numeros = [
    { valor: String(modulos), label: 'módulos' },
    { valor: `${horas}h`, label: 'de leitura' },
    // Ausente do manifesto: omite a linha em vez de exibir 0 ou um literal
    // decorado. Um dado a menos é melhor que um dado errado numa vitrine.
    ...(estatisticas
      ? [
          { valor: String(estatisticas.diagramas), label: 'diagramas interativos' },
          { valor: String(estatisticas.quizzes), label: 'quizzes com SRS' },
        ]
      : []),
    { valor: xp.toLocaleString('pt-BR'), label: 'XP' },
  ];

  return (
    <section className="px-6 py-14" aria-labelledby="bedrock-destaque-heading">
      <div
        className="mx-auto max-w-6xl overflow-hidden rounded-3xl"
        style={{
          border: `1px solid color-mix(in srgb, ${ACCENT} 35%, transparent)`,
          background: `linear-gradient(135deg, color-mix(in srgb, ${ACCENT} 9%, var(--ffv-bg2)) 0%, var(--ffv-bg2) 55%)`,
        }}
      >
        <div className="grid gap-8 p-7 md:grid-cols-[1.15fr_1fr] md:p-10">
          {/* Coluna esquerda — a promessa */}
          <div className="min-w-0">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider"
              style={{
                background: `color-mix(in srgb, ${ACCENT} 18%, transparent)`,
                color: ACCENT,
                border: `1px solid color-mix(in srgb, ${ACCENT} 40%, transparent)`,
              }}
            >
              🪨 Trilha em destaque
            </span>

            <h2
              id="bedrock-destaque-heading"
              className="mt-4 text-2xl font-bold leading-tight md:text-[2rem]"
            >
              AWS Bedrock — engenharia de soluções de IA
            </h2>

            <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
              A trilha mais completa da escola. Do primeiro <em>hello world</em> na
              Converse API até a arquitetura que uma empresa realmente coloca em
              produção — RAG, tool use, agents, evals, FinOps e governança. Com
              diagramas de arquitetura que você percorre passo a passo.
            </p>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {numeros.map(n => (
                <div key={n.label}>
                  <dt className="text-[0.7rem] uppercase tracking-wide" style={{ color: 'var(--ffv-muted)' }}>
                    {n.label}
                  </dt>
                  <dd className="text-xl font-bold" style={{ color: ACCENT }}>{n.valor}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/aws-bedrock/"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02]"
                style={{ background: ACCENT, color: '#0d1117' }}
              >
                Ver a trilha completa →
              </Link>
              <Link
                href="/aprenda/bedrock-o-que-e-e-por-que/"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{ border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
              >
                Começar pelo módulo 1
              </Link>
            </div>

            <p className="mt-4 text-xs" style={{ color: 'var(--ffv-muted)' }}>
              Gratuita, em português, sem paywall — como todo o conteúdo da escola.
            </p>
          </div>

          {/* Coluna direita — os pilares */}
          <ul className="flex flex-col gap-3">
            {PILARES.map(p => (
              <li
                key={p.title}
                className="flex gap-3 rounded-2xl p-3.5"
                style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
              >
                <span aria-hidden="true" className="text-xl leading-none">{p.icon}</span>
                <span className="min-w-0">
                  <span className="block text-[0.85rem] font-semibold">{p.title}</span>
                  <span className="mt-0.5 block text-[0.78rem] leading-snug" style={{ color: 'var(--ffv-muted)' }}>
                    {p.desc}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
