import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('password-hashing-moderno');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que SHA-256 puro é crime pra senha?',
    options: [
      'É slow demais',
      'SHA-256 é projetado pra ser RÁPIDO. GPU moderna calcula bilhões/s. Atacante com vazamento bruteforce 80% de senhas comuns em horas. Password hashing precisa ser DEVAGAR DE PROPÓSITO',
      'Produz colisões',
      'Não é standard',
    ],
    correct: 1,
    explanation: 'Hash de senha é anti-padrão: quer ser lento (memory-hard, compute-hard) pra dificultar bruteforce. SHA-256, MD5, SHA-1: tudo crime. Use Argon2id (OWASP #1), scrypt, ou bcrypt (aceitável). PBKDF2 só se forçado por compliance (NIST).',
  },
  {
    question: 'O que OWASP recomenda em 2024 para password hashing?',
    options: [
      'SHA-256 com muitas iterações',
      'Argon2id com t=2, m=19MiB, p=1 (ou bcrypt work factor 12+ se Argon não disponível)',
      'Apenas bcrypt',
      'MD5 com pepper',
    ],
    correct: 1,
    explanation: 'OWASP Password Storage Cheat Sheet 2024: 1º Argon2id (2 iterações, 19 MiB memória, 1 paralelismo). 2º scrypt. 3º bcrypt (work factor ≥12). 4º PBKDF2 (600k+ iterações SHA-256) só pra compliance FIPS.',
  },
  {
    question: 'O que é "pepper" e onde ele vive?',
    options: [
      'É o mesmo que salt',
      'Secret ADICIONAL no server (env var ou HSM) que é concatenado à senha antes de hashear. Diferente do salt (armazenado no DB), pepper mora FORA do DB. Defesa extra contra vazamento de DB sem vazamento de server',
      'Tempero de rotina',
      'Algoritmo de criptografia',
    ],
    correct: 1,
    explanation: 'Salt: random por user, armazenado com hash (defesa contra rainbow tables). Pepper: secret global no server (env/Vault/HSM). Se DB vaza mas server não, hashes ficam inúteis pra bruteforce. Rotação de pepper é operação delicada — requer rehash.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="password-hashing-moderno"
      title="Password hashing moderno: argon2, bcrypt, peppers"
      icon="🧂"
      xp={45}
      readTime={10}
      trailName="Security Engineering"
      trailColor={accent}
      nextSlug="owasp-top-10-com-exemplo-em-codigo"
      nextTitle="OWASP Top 10 (2024) com exemplo em código"
      quiz={quiz}
    >
      <Section title="Argon2id em Node/TS" accent={accent}>
        <CodeBlock lang="typescript">{`import { hash, verify, argon2id } from '@node-rs/argon2'; // ou 'argon2' (native)

const PEPPER = process.env.PASSWORD_PEPPER!; // 32+ random bytes, nunca no git

async function hashPassword(plaintext: string): Promise<string> {
  // Pepper concatenado (convenção: antes do hash)
  const peppered = plaintext + PEPPER;
  return await hash(peppered, {
    algorithm: argon2id,
    timeCost: 2,       // t
    memoryCost: 19456, // m em KiB (19 MiB — OWASP 2024)
    parallelism: 1,    // p
  });
}

async function verifyPassword(plaintext: string, hashStr: string): Promise<boolean> {
  const peppered = plaintext + PEPPER;
  return await verify(hashStr, peppered);
}`}</CodeBlock>
      </Section>

      <Section title="Timing-safe compare e clock attack" accent={accent}>
        <p>
          Nunca use <InlineCode>===</InlineCode> pra comparar hashes ou tokens. String compare retorna early no primeiro byte diferente — atacante mede tempo e infere byte-a-byte.
        </p>
        <CodeBlock lang="typescript">{`import { timingSafeEqual } from 'node:crypto';

// ❌
if (userHash === storedHash) allow();  // timing leak

// ✅
const a = Buffer.from(userHash, 'hex');
const b = Buffer.from(storedHash, 'hex');
if (a.length === b.length && timingSafeEqual(a, b)) allow();`}</CodeBlock>
      </Section>

      <Section title="Parâmetros ao longo do tempo" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Ano', 'Argon2id recomendado', 'bcrypt work factor']}
          rows={[
            ['2018', 't=3, m=12MiB', '10'],
            ['2021', 't=2, m=15MiB', '11'],
            ['2024', 't=2, m=19MiB', '12'],
            ['2027 (projetado)', 't=2, m=32MiB', '13'],
          ]}
        />
        <Callout tone="info" icon="💡">
          Hardware fica mais rápido; parâmetros sobem. Armazene <InlineCode>algo</InlineCode>+<InlineCode>params</InlineCode> no hash (argon2 já faz: <InlineCode>$argon2id$v=19$m=19456,t=2,p=1$...</InlineCode>). No login, detecte hash desatualizado e rehash silenciosamente.
        </Callout>
      </Section>

      <Section title="Rehash silencioso no login" accent={accent}>
        <CodeBlock lang="typescript">{`async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  // Detecta hash desatualizado e rehash
  const currentParams = extractParams(user.passwordHash);
  if (needsRehash(currentParams, TARGET_PARAMS)) {
    const newHash = await hashPassword(password);
    await db.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
  }

  return user;
}`}</CodeBlock>
        <p>
          Invisível pro user, migração gradual: cada login atualiza hash pro padrão novo. Em 3–6 meses, base inteira está em parâmetros modernos sem reset forçado.
        </p>
      </Section>
    </ModuleLayout>
  );
}
