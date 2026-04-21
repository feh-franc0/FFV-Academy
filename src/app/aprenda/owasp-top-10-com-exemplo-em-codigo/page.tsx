import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('owasp-top-10-com-exemplo-em-codigo');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a vulnerabilidade #1 (A01) no OWASP Top 10 2021/2024?',
    options: [
      'SQL injection',
      'Broken Access Control — IDORs, faltar verificação de owner, endpoints admin expostos, path traversal',
      'XSS',
      'Weak cryptography',
    ],
    correct: 1,
    explanation: 'A01 Broken Access Control. Subiu pra #1 porque é altamente prevalente (94% dos apps testados tinham) e alto impacto. Inclui: IDOR, elevation (user vira admin), faltar check em endpoint, bypass via manipulação de request, path traversal.',
  },
  {
    question: 'A10 (SSRF) permite atacar o quê?',
    options: [
      'Só o cliente',
      'Recursos INTERNOS (metadata AWS 169.254.169.254, Redis local, serviços privados) porque o server faz request em nome do atacante',
      'Apenas APIs públicas',
      'Navegador do usuário',
    ],
    correct: 1,
    explanation: 'SSRF (Server-Side Request Forgery): atacante faz server bater em URL interna. Ex: user envia "image_url=http://169.254.169.254/latest/meta-data" e server faz fetch — vazando IAM role. Caso Capital One 2019: roubaram 100M de dados via SSRF.',
  },
  {
    question: 'Como mitigar A03 (Injection) em TypeScript moderno?',
    options: [
      'String concatenation com cuidado',
      'Prepared statements / parametrized queries em DB (Prisma/Drizzle/pg), template tag sql`` do slonik/postgres.js, Zod validation em boundaries, NUNCA concatenar SQL/HTML/shell com input',
      'Usar só TypeScript',
      'Só escapar aspas',
    ],
    correct: 1,
    explanation: 'Parametrized queries separam código de dado. Prisma: `db.user.findMany({ where: { email } })`. Drizzle/Knex idem. Raw SQL: template tag `sql\\`SELECT * FROM users WHERE email = \\${email}\\`` do lib. NUNCA `\\`SELECT ... WHERE email = \\${email}\\`` raw.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="owasp-top-10-com-exemplo-em-codigo"
      title="OWASP Top 10 (2024) com exemplo em código"
      icon="📋"
      xp={70}
      readTime={16}
      trailName="Security Engineering"
      trailColor={accent}
      nextSlug="secrets-management"
      nextTitle="Secrets management: Vault, SOPS e AWS Secrets Manager"
      quiz={quiz}
    >
      <Section title="OWASP Top 10 — 2024 edition" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['ID', 'Categoria', 'Prevalência']}
          rows={[
            ['A01', 'Broken Access Control', '94% dos apps'],
            ['A02', 'Cryptographic Failures', '77%'],
            ['A03', 'Injection (SQLi, XSS, cmd)', '94%'],
            ['A04', 'Insecure Design', 'N/A (categoria de design)'],
            ['A05', 'Security Misconfiguration', '90%'],
            ['A06', 'Vulnerable & Outdated Components', 'Alta'],
            ['A07', 'Identification & Authentication Failures', 'Média'],
            ['A08', 'Software & Data Integrity Failures', 'Alta'],
            ['A09', 'Security Logging & Monitoring Failures', 'Alta'],
            ['A10', 'Server-Side Request Forgery (SSRF)', 'Emergente'],
          ]}
        />
      </Section>

      <Section title="A01 — Broken Access Control (IDOR)" accent={accent}>
        <CodeBlock lang="typescript">{`// ❌ RUIM — só checa autenticação
app.get('/orders/:id', requireAuth, async (req) => {
  const order = await db.order.findUnique({ where: { id: req.params.id } });
  return order;  // qualquer user logado vê qualquer order
});

// ✅ OK — check de owner no query
app.get('/orders/:id', requireAuth, async (req) => {
  const order = await db.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!order) return 404;
  return order;
});`}</CodeBlock>
      </Section>

      <Section title="A03 — Injection" accent={accent}>
        <CodeBlock lang="typescript">{`// ❌ SQLi clássico
const raw = await db.query(
  \`SELECT * FROM users WHERE email = '\${req.body.email}'\`
);

// ✅ Parametrized
const raw = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [req.body.email]
);

// ✅ ORM (recomendado)
const user = await prisma.user.findUnique({ where: { email: req.body.email } });`}</CodeBlock>
        <p>
          XSS (variante de injection no HTML): React já escapa <InlineCode>{`{value}`}</InlineCode> por default. Cuidado com <InlineCode>dangerouslySetInnerHTML</InlineCode> — só use se sanitizar com DOMPurify. <InlineCode>href={`{url}`}</InlineCode> com <InlineCode>url</InlineCode> do user pode virar <InlineCode>javascript:</InlineCode>; valide com URL constructor.
        </p>
      </Section>

      <Section title="A10 — SSRF e fetch de URLs externas" accent={accent}>
        <CodeBlock lang="typescript">{`// ❌ Vulnerável — user passa URL, server fetch
app.post('/import-avatar', async (req) => {
  const img = await fetch(req.body.url);  // SSRF!
  // req.body.url = "http://169.254.169.254/latest/meta-data/iam/..."
  // → vaza IAM role
});

// ✅ Whitelist de domínios + bloqueio de ranges privados
const ALLOWED = ['imgur.com', 'i.imgur.com', 's3.amazonaws.com'];
const PRIVATE_RANGES = [/^10\\./, /^172\\.(1[6-9]|2\\d|3[01])\\./, /^192\\.168\\./, /^127\\./, /^169\\.254\\./];

function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return null;
    if (!ALLOWED.includes(u.hostname)) return null;
    // Resolve DNS e checa IP (evita rebinding)
    return u;
  } catch { return null; }
}

// Extra: usar proxy dedicado, timeout, body size limit.`}</CodeBlock>
      </Section>

      <Section title="A09 — Logging e Monitoring" accent={accent}>
        <p>
          Falha comum: sem log estruturado de tentativas de login, escalation, 4xx suspeito. Sem log, incident response vira arqueologia.
        </p>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Log estruturado (JSON) com <InlineCode>request_id</InlineCode>, <InlineCode>user_id</InlineCode>, <InlineCode>action</InlineCode>, <InlineCode>result</InlineCode>.</li>
          <li>Security events separados (login fail, perm denied, admin action).</li>
          <li>Alerting: 10 login fails na mesma conta em 1min → investigar.</li>
          <li>Imutabilidade (append-only, CloudWatch Logs Insights, BigQuery).</li>
          <li>NUNCA logar senha, token, PII bruto. Redact.</li>
        </ul>
      </Section>

      <Callout tone="success" icon="✅">
        OWASP Top 10 é ponto de partida, não destino. Cada projeto tem seu próprio top 10 (descoberto via threat modeling + pentest). Trate esta lista como checklist de cobertura mínima.
      </Callout>
    </ModuleLayout>
  );
}
