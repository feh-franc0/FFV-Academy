import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Melhores Ferramentas de IA para Código em 2026 — Ranking técnico',
  description: 'Ranking técnico das melhores ferramentas de IA para código em 2026: Claude Code, Cursor, Codex, Copilot, Amazon Q, Kiro. Sem hype — filosofia, arquitetura e quando usar.',
  keywords: 'melhores ferramentas ia codigo 2026, ranking ia programacao, claude code, cursor, codex, github copilot, amazon q, kiro, coding agents 2026',
  alternates: { canonical: 'https://fernandofrancovalle.com/melhores-ferramentas-ia-codigo-2026' },
  openGraph: {
    title: 'Melhores Ferramentas de IA para Código em 2026',
    description: 'Filosofia, arquitetura e caso de uso real. Sem hype.',
    type: 'article',
    url: 'https://fernandofrancovalle.com/melhores-ferramentas-ia-codigo-2026',
  },
};

const tools = [
  { name: 'Claude Code',    tag: 'Harness agentic',    vendor: 'Anthropic', who: 'Dev sênior que quer autonomia real e hooks/automação.', color: '#c9a66b' },
  { name: 'Cursor',         tag: 'IDE fork',           vendor: 'Cursor (Anysphere)', who: 'Dev que vive no IDE e quer multi-modelo num lugar só.', color: '#58a6ff' },
  { name: 'Codex / ChatGPT',tag: 'Agente OpenAI',      vendor: 'OpenAI', who: 'Quem já mora no ecossistema OpenAI.', color: '#10a37f' },
  { name: 'GitHub Copilot', tag: 'Autocomplete + chat',vendor: 'GitHub / Microsoft', who: 'Time grande já integrado no GitHub.', color: '#d29922' },
  { name: 'Amazon Q Developer', tag: 'Assistente cloud-nativo', vendor: 'AWS', who: 'Quem vive em AWS e precisa de contexto da conta.', color: '#f78166' },
  { name: 'Kiro',           tag: 'Spec-driven agent',  vendor: 'AWS (Kiro Team)', who: 'Dev que quer workflow baseado em specs/planos.', color: '#a371f7' },
];

export default function MelhoresFerramentasPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Melhores ferramentas IA 2026</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Melhores ferramentas de IA para código — 2026</h1>
        <p className="text-base" style={{ color: 'var(--ffv-muted)' }}>
          Não é um top 10 de SEO. É a leitura técnica de quem usa as seis principais plataformas em projetos reais: filosofia, arquitetura e quando cada uma vence.
        </p>
      </header>

      <section className="mb-10 p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-2">Antes: elas não competem direto</h2>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Harness agentic (Claude Code, Codex) vs IDE fork (Cursor) vs plugin de autocomplete (Copilot) vs agente cloud-nativo (Amazon Q) são <b>categorias diferentes</b>. Ranking sem categoria é marketing.
        </p>
      </section>

      <div className="flex flex-col gap-4 mb-10">
        {tools.map(t => (
          <div key={t.name} className="p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${t.color}40` }}>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-lg font-bold" style={{ color: t.color }}>{t.name}</h3>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}>
                {t.tag}
              </span>
              <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>· {t.vendor}</span>
            </div>
            <p className="text-sm"><b>Para quem:</b> {t.who}</p>
          </div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Como escolher</h2>
        <ol className="text-sm space-y-2 list-decimal pl-5">
          <li>Escreva o tipo de tarefa dominante (autocompleta, refatora, escreve feature nova, roda scripts).</li>
          <li>Escolha a categoria certa — não a marca: autocomplete, IDE, harness, agente cloud.</li>
          <li>Dentro da categoria, otimize por modelo/contexto e por integração com o repo.</li>
          <li>Nada impede combinar: Cursor para editar + Claude Code para tarefas autônomas.</li>
        </ol>
      </section>

      <section className="mb-10 p-6 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-xl font-bold mb-3">Quer a comparação detalhada Claude Code vs Cursor?</h2>
        <Link
          href="/claude-code-vs-cursor"
          className="inline-block px-5 py-2.5 rounded-full font-semibold text-sm"
          style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
        >
          Ler comparação técnica →
        </Link>
      </section>
    </article>
  );
}
