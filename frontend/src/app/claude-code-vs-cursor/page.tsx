import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE, social } from '@/lib/metadata-social';

export const metadata: Metadata = {
  title: 'Claude Code vs Cursor 2026 — Comparação técnica real',
  description: 'Comparação técnica detalhada entre Claude Code (Anthropic) e Cursor em 2026: arquitetura, agentic loop, modelo, contexto, custos, quando usar cada um. Sem hype, só engenharia.',
  keywords: 'claude code vs cursor, comparacao claude code cursor, claude code 2026, cursor 2026, melhor ferramenta ia codigo, anthropic cursor, agentic coding',
  alternates: { canonical: `${BASE}/claude-code-vs-cursor` },
  ...social({
    titulo: 'Claude Code vs Cursor 2026 — Comparação técnica real',
    descricao: 'Arquitetura, agentic loop, contexto e custo. A diferença real entre Claude Code e Cursor em 2026.',
    caminho: '/claude-code-vs-cursor',
    tipo: 'article',
  }),
};

const rows: Array<{ label: string; cc: string; cursor: string }> = [
  { label: 'Forma',            cc: 'CLI / harness agentic',            cursor: 'IDE fork (VS Code)' },
  { label: 'Modelo default',   cc: 'Claude Sonnet/Opus 4.x',           cursor: 'Multi-modelo (GPT, Claude, Gemini)' },
  { label: 'Contexto',         cc: 'Até 1M tokens (Opus 4.7 1M)',      cursor: 'Depende do modelo escolhido' },
  { label: 'Execução',         cc: 'Loop agentic com tools + bash',    cursor: 'Chat + Cmd-K + agent mode' },
  { label: 'Sub-agents',       cc: 'Nativo (TaskCreate, subagents)',   cursor: 'Limitado' },
  { label: 'Hooks / automação',cc: 'settings.json (hooks nativos)',    cursor: 'Sem hooks equivalentes' },
  { label: 'Skills / plugins', cc: 'Skills + plugins + MCP',           cursor: 'MCP' },
  { label: 'Cobrança',         cc: 'API / Max plan',                   cursor: 'Assinatura mensal fixa' },
  { label: 'Refatoração ampla',cc: 'Forte (lê grande parte do repo)',  cursor: 'Forte no inline, limitado no escopo' },
  { label: 'Quem ganha',       cc: 'Trabalho autônomo, CI, scripts',   cursor: 'Edição interativa no IDE' },
];

export default function ClaudeCodeVsCursorPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Claude Code vs Cursor 2026</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Claude Code vs Cursor 2026</h1>
        <p className="text-base" style={{ color: 'var(--ffv-muted)' }}>
          Zero hype. Arquitetura real, diferenças de modelo, contexto e automação. Em qual delas faz sentido apostar — e em qual caso.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">TL;DR</h2>
        <p className="text-sm mb-3">
          Claude Code é um <b>harness agentic de terminal</b> feito pela Anthropic, otimizado pra rodar ciclos autônomos longos (ler repo, editar, rodar testes, fazer PR). Cursor é um <b>IDE fork</b> focado em produtividade interativa — autocompleta, Cmd-K, chat lateral.
        </p>
        <p className="text-sm">
          Não são a mesma categoria. Cursor substitui o VS Code; Claude Code substitui o cérebro do dev em tarefas complexas. Usuários avançados combinam os dois.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Comparação técnica</h2>
        <div tabIndex={0} role="group" aria-label="Comparação técnica, rolável na horizontal" className="overflow-x-auto rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ffv-blue)]" style={{ border: '1px solid var(--ffv-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--ffv-bg2)' }}>
                <th className="text-left px-4 py-3 font-semibold">Dimensão</th>
                <th className="text-left px-4 py-3 font-semibold">Claude Code</th>
                <th className="text-left px-4 py-3 font-semibold">Cursor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} style={{ borderTop: '1px solid var(--ffv-border)', background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)' }}>
                  <td className="px-4 py-3 font-semibold">{r.label}</td>
                  <td className="px-4 py-3">{r.cc}</td>
                  <td className="px-4 py-3">{r.cursor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Quando usar Claude Code</h2>
        <ul className="text-sm space-y-2 list-disc pl-5">
          <li>Refatorações que tocam dezenas de arquivos.</li>
          <li>Migrações e upgrades de dependência com testes.</li>
          <li>Scripts de automação rodando em CI ou cron.</li>
          <li>Você quer um agente autônomo com hooks e permissions.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Quando usar Cursor</h2>
        <ul className="text-sm space-y-2 list-disc pl-5">
          <li>Edição interativa acelerada por autocomplete.</li>
          <li>Você prefere ficar dentro da experiência IDE (VS Code).</li>
          <li>Quer trocar de modelo (GPT, Claude, Gemini) em um lugar só.</li>
        </ul>
      </section>

      <section className="mb-10 p-6 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-xl font-bold mb-3">Quer aprender Claude Code a fundo?</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--ffv-muted)' }}>
          Temos uma trilha completa sobre ferramentas de IA para código — o que cada uma resolve e onde cada uma custa caro. Grátis, com quiz e XP.
        </p>
        <Link
          href="/ferramentas-ia-codigo"
          className="inline-block px-5 py-2.5 rounded-full font-semibold text-sm"
          style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
        >
          Abrir trilha de ferramentas →
        </Link>
      </section>
    </article>
  );
}
