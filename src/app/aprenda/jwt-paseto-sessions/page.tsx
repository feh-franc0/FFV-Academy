import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('jwt-paseto-sessions');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que JWT é problema para logout/revoke?',
    options: [
      'JWT é obsoleto',
      'JWT é stateless — o server não mantém lista de tokens emitidos; revogar exige lista de denylist OU TTL curto + refresh rotation. Session em Redis é mais simples pra logout imediato',
      'JWT não suporta expiração',
      'JWT só funciona em HTTPS',
    ],
    correct: 1,
    explanation: 'Stateless é a feature E o problema. Token válido até expirar; não dá pra "invalidar" sem storage. Soluções: (a) access token curto (~15min) + refresh rotation, (b) denylist em Redis com JTI, (c) simplesmente usar session. Em apps clássicos, session é mais simples.',
  },
  {
    question: 'O que é "algorithm confusion" em JWT?',
    options: [
      'Bug no compilador',
      'Atacante muda header alg de RS256 (assinatura assimétrica) pra HS256 (simétrica) e usa a public key do server como "secret" HMAC. Server valida e aceita. Fix: verificar alg esperado no código, nunca confiar no header',
      'Confusão entre encoding',
      'Limite de tamanho de token',
    ],
    correct: 1,
    explanation: 'Ataque clássico (2015+). Libs velhas aceitavam qualquer alg. Defesa: `verify(token, key, { algorithms: ["RS256"] })`. Paseto v4 nasceu em resposta — não tem "alg" no header (versão já determina o cipher).',
  },
  {
    question: 'Por que Paseto v4 é "mais seguro por default" que JWT?',
    options: [
      'Ninguém usa Paseto',
      'Paseto v4: sem algorithm confusion (versão determina cipher, não header), sem alg none, cipher fixo moderno (Ed25519/XChaCha20), payload compacto binário. Elimina por design várias armadilhas do JWT',
      'Paseto é binário, incompatível',
      'Paseto usa SHA-1',
    ],
    correct: 1,
    explanation: 'Paseto (Platform-Agnostic SEcurity TOkens) v4 tem 2 formatos: local (encrypted, XChaCha20-Poly1305) e public (signed, Ed25519). Versão na URI força cipher seguro. "alg: none", algorithm confusion e cipher fraco não existem. Lib recomendada: paseto-ts.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="jwt-paseto-sessions"
      title="JWT, Paseto ou sessions: quando cada um"
      icon="🎫"
      xp={55}
      readTime={12}
      trailName="Security Engineering"
      trailColor={accent}
      nextSlug="password-hashing-moderno"
      nextTitle="Password hashing moderno: argon2, bcrypt, peppers"
      quiz={quiz}
    >
      <Section title="Trade-offs" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Session (Redis)', 'JWT', 'Paseto v4']}
          rows={[
            ['Stateful', 'Sim', 'Não', 'Não'],
            ['Revoke imediato', '✅ Trivial', '❌ Difícil (denylist ou TTL)', '❌ Difícil (mesmo problema)'],
            ['Escala horizontal', 'OK com Redis', '✅ Perfeito', '✅ Perfeito'],
            ['Payload bloat', 'N/A', '⚠️ Sim (claims viajam)', '⚠️ Sim'],
            ['Algorithm confusion', 'N/A', '⚠️ Risco', '✅ Impossível'],
            ['Edge/CDN-friendly', '❌', '✅', '✅'],
            ['Curva aprendizado', 'Baixa', 'Alta (pegadinhas)', 'Média'],
          ]}
        />
      </Section>

      <Section title="Recomendação pragmática" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>App B2C clássico</strong> (web monolito): session em Redis. Logout trivial, sem armadilha.</li>
          <li><strong>API pública / mobile</strong>: access token curto (15min) + refresh token (7d) com rotation.</li>
          <li><strong>Edge / serverless</strong>: JWT ou Paseto — stateless vence.</li>
          <li><strong>Novo projeto greenfield</strong>: Paseto v4 &gt; JWT pela DX e segurança por default.</li>
        </ul>
      </Section>

      <Section title="Refresh token rotation" accent={accent}>
        <CodeBlock lang="typescript">{`// Padrão: refresh uso único, rota nova a cada uso
async function refresh(oldRefreshToken: string) {
  const stored = await db.refreshTokens.findUnique({ where: { token: oldRefreshToken } });
  if (!stored || stored.usedAt) {
    // REUSO DETECTADO — refresh roubado. Invalidar família inteira
    if (stored) await db.refreshTokens.updateMany({
      where: { familyId: stored.familyId },
      data: { revokedAt: new Date() },
    });
    throw new Error('refresh reuse detected');
  }

  await db.refreshTokens.update({
    where: { token: oldRefreshToken },
    data: { usedAt: new Date() },
  });

  const newRefresh = crypto.randomBytes(32).toString('hex');
  await db.refreshTokens.create({
    data: { token: newRefresh, familyId: stored.familyId, userId: stored.userId },
  });

  return {
    accessToken: signAccessToken(stored.userId, '15m'),
    refreshToken: newRefresh,
  };
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Detectar reuse e invalidar FAMÍLIA é o padrão seguro. Auth0, Okta, Supabase fazem isso. Sem rotation, refresh roubado = acesso permanente.
        </Callout>
      </Section>

      <Section title="Armadilhas do JWT" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>alg: none</strong> — aceitar &quot;sem assinatura&quot;. Lib moderna bloqueia; verifique.</li>
          <li><strong>Algorithm confusion</strong> — sempre passe <InlineCode>{'{ algorithms: [\'RS256\'] }'}</InlineCode> explicitamente.</li>
          <li><strong>Claim bloat</strong> — token vira 4KB com 50 perms. Use reference token (opaco) ou busque perms do server.</li>
          <li><strong>Clock skew</strong> — validar <InlineCode>exp</InlineCode> com tolerância (±30s).</li>
          <li><strong>JTI + denylist</strong> — único modo de revoke real em JWT puro.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
