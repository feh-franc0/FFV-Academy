import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE, social } from '@/lib/metadata-social';

export const metadata: Metadata = {
  title: 'Cheatsheet Claude Code + IA para Código (PDF grátis)',
  description: 'Receba o PDF de Cheatsheet do Claude Code: hooks, skills, sub-agents, MCP e atalhos de produtividade. Grátis, direto no email. Zero spam.',
  keywords: 'cheatsheet claude code, pdf claude code, cola claude code, atalhos claude code, referencia ia codigo',
  alternates: { canonical: `${BASE}/cheatsheet` },
  ...social({
    titulo: 'Cheatsheet Claude Code (PDF grátis) — FFV Academy',
    descricao: 'Hooks, skills, sub-agents, MCP e atalhos. PDF direto no email.',
    caminho: '/cheatsheet',
    tipo: 'article',
  }),
};

// Substituir pela URL real do Buttondown ao configurar a conta
const BUTTONDOWN_USERNAME = 'fernandofrancovalle';

export default function CheatsheetPage() {
  return (
    <article className="max-w-2xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Cheatsheet PDF</span>
      </nav>

      <header className="mb-10 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Cheatsheet Claude Code — PDF grátis</h1>
        <p className="text-base" style={{ color: 'var(--ffv-muted)' }}>
          Referência rápida de hooks, skills, sub-agents, MCP e atalhos. Uma página, printável, pra deixar aberta no segundo monitor.
        </p>
      </header>

      <section className="mb-8 p-6 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-3">O que tem no PDF</h2>
        <ul className="text-sm space-y-2 list-disc pl-5">
          <li>Anatomia do harness agentic (loop, tools, permissions).</li>
          <li>Hooks de <code>settings.json</code> — quais existem e quando usar.</li>
          <li>Skills: estrutura, nomes, anatomia de uma skill bem escrita.</li>
          <li>Sub-agents: padrão de delegação e quando faz sentido.</li>
          <li>MCP servers — lista dos mais úteis.</li>
          <li>Atalhos, slash commands e modos (Plan, Explore, Fast).</li>
        </ul>
      </section>

      <section className="mb-10 p-6 rounded-xl" style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-4">Receber o PDF no email</h2>
        <form
          action={`https://buttondown.email/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`}
          method="post"
          target="popupwindow"
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="tag" value="cheatsheet-pdf" />
          <label htmlFor="bd-email" className="text-xs font-semibold" style={{ color: 'var(--ffv-muted)' }}>
            Seu email
          </label>
          <input
            id="bd-email"
            type="email"
            name="email"
            required
            placeholder="voce@email.com"
            className="px-4 py-3 rounded-lg text-sm"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-lg font-semibold text-sm"
            style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
          >
            Receber cheatsheet →
          </button>
          <p className="text-[11px]" style={{ color: 'var(--ffv-muted)' }}>
            Entregue por Buttondown. Zero spam. Cancelamento em 1 clique.
          </p>
        </form>
      </section>

      <section className="text-center">
        <p className="text-sm mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Ou pule o email e abra a trilha completa:
        </p>
        <Link
          href="/aws-bedrock"
          className="inline-block px-5 py-2.5 rounded-full font-semibold text-sm"
          style={{ background: 'var(--ffv-bg2)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
        >
          Abrir Claude Code Masterclass →
        </Link>
      </section>
    </article>
  );
}
