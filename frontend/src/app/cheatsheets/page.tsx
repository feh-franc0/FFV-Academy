import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cheatsheets profissionais — FFV Academy',
  description: 'Cheatsheets imprimíveis (PDF) dos temas mais consultados. Conteúdo denso, sem hype, PT-BR.',
  keywords: 'cheatsheet postgres, cheatsheet git, cheatsheet kubernetes, cheatsheet rust, cheatsheet system design',
};

interface CheatsheetSummary {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  accent: string;
  emoji?: string;
}

// Fallback usado quando o backend não responde — replica os 5 originais.
const FALLBACK: CheatsheetSummary[] = [
  { slug: 'postgres', emoji: '🐘', title: 'Postgres essencial', description: 'Índices, EXPLAIN ANALYZE, MVCC, VACUUM, transações.', accent: '#336791' },
  { slug: 'git', emoji: '🌿', title: 'Git avançado', description: 'Rebase, reflog, bisect, worktree, cherry-pick, hooks.', accent: '#f05032' },
  { slug: 'kubernetes', emoji: '☸️', title: 'Kubernetes diário', description: 'kubectl cheat, YAML por resource, troubleshooting, RBAC.', accent: '#326ce5' },
  { slug: 'rust', emoji: '🦀', title: 'Rust essencial', description: 'Ownership, borrow rules, lifetimes, traits, cargo.', accent: '#b7410e' },
  { slug: 'system-design', emoji: '🧩', title: 'System Design prep', description: 'Framework de interview, back-of-envelope, padrões.', accent: '#ea580c' },
];

async function fetchAllCheatsheets(): Promise<CheatsheetSummary[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  if (!apiBase) return FALLBACK;
  try {
    const res = await fetch(`${apiBase}/api/v1/cheatsheets`, { next: { revalidate: 600 } });
    if (!res.ok) return FALLBACK;
    const body = (await res.json()) as { data?: CheatsheetSummary[] };
    return body.data && body.data.length > 0 ? body.data : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export default async function Page() {
  const items = await fetchAllCheatsheets();
  return (
    <article className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Cheatsheets profissionais</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Referência rápida pros temas que você consulta toda semana. Baixe como PDF direto do browser (Salvar como PDF no diálogo de impressão).
        </p>
      </header>
      <div className="grid gap-4">
        {items.map(cs => (
          <Link
            key={cs.slug}
            href={`/cheatsheets/${cs.slug}`}
            className="block p-5 rounded-xl border transition-colors hover:opacity-90"
            style={{ borderColor: `${cs.accent}40`, background: `color-mix(in srgb, ${cs.accent} 6%, transparent)` }}
          >
            <div className="flex items-start gap-4">
              {cs.emoji && <div className="text-3xl">{cs.emoji}</div>}
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-1" style={{ color: cs.accent }}>{cs.title}</h2>
                <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>{cs.description ?? cs.subtitle ?? ''}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
