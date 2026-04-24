import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cheatsheets profissionais — FFV Academy',
  description: 'Cheatsheets imprimíveis (PDF) dos temas mais consultados: Postgres, Git, Kubernetes, Rust, System Design. Conteúdo denso, sem hype, PT-BR.',
  keywords: 'cheatsheet postgres, cheatsheet git avancado, cheatsheet kubernetes, cheatsheet rust, cheatsheet system design',
};

const CHEATSHEETS = [
  { slug: 'postgres',      emoji: '🐘', title: 'Postgres essencial', desc: 'Índices, EXPLAIN ANALYZE, MVCC, VACUUM, transações, backup/restore.', color: '#336791' },
  { slug: 'git',           emoji: '🌿', title: 'Git avançado',       desc: 'Rebase, reflog, bisect, worktree, cherry-pick, submodules, hooks.', color: '#f05032' },
  { slug: 'kubernetes',    emoji: '☸️', title: 'Kubernetes diário',   desc: 'kubectl cheat, YAML mínimo por resource, troubleshooting, RBAC, NetworkPolicy.', color: '#326ce5' },
  { slug: 'rust',          emoji: '🦀', title: 'Rust essencial',     desc: 'Ownership, borrow rules, lifetimes, traits canônicos, cargo, error handling.', color: '#b7410e' },
  { slug: 'system-design', emoji: '🧩', title: 'System Design prep', desc: 'Framework de interview, back-of-envelope, números-chave, padrões canônicos.', color: '#ea580c' },
];

export default function Page() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Cheatsheets profissionais</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Referência rápida pros temas que você consulta toda semana. Baixe como PDF direto do browser (Salvar como PDF no diálogo de impressão).
        </p>
      </header>
      <div className="grid gap-4">
        {CHEATSHEETS.map(cs => (
          <Link
            key={cs.slug}
            href={`/cheatsheets/${cs.slug}`}
            className="block p-5 rounded-xl border transition-colors hover:opacity-90"
            style={{ borderColor: `${cs.color}40`, background: `color-mix(in srgb, ${cs.color} 6%, transparent)` }}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{cs.emoji}</div>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1" style={{ color: cs.color }}>{cs.title}</h2>
                <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>{cs.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
