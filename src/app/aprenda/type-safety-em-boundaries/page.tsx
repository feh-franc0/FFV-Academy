import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('type-safety-em-boundaries');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que TypeScript compile-time NÃO protege de dados malformados vindos de API?',
    options: [
      'Porque o TS não compila para navegador',
      'Porque tipos são apagados na compilação — no runtime, qualquer JSON passa direto sem checagem, e seu tipo é só uma promessa que pode mentir',
      'Porque APIs sempre mandam o shape certo',
      'Porque o JSON tem tipos próprios',
    ],
    correct: 1,
    explanation: 'tsc apaga tipos antes do código rodar. Se a API mudar o shape ou mandar erro sem o campo esperado, seu código vai quebrar num ponto arbitrário. A única defesa: validar com schema (Zod, Valibot, io-ts) no ponto de entrada.',
  },
  {
    question: 'O que faz `z.infer<typeof Schema>` em Zod?',
    options: [
      'Gera código em runtime',
      'Infere o tipo TypeScript a partir do schema — uma só fonte de verdade. Escreve schema e ganha o tipo de graça',
      'Faz parse assíncrono',
      'É só decoração, não faz nada',
    ],
    correct: 1,
    explanation: 'z.infer é o pulo do gato: você declara o shape UMA vez como schema Zod, e o tipo TS é derivado. Zero duplicação. Se muda o schema, o tipo muda automaticamente. É o padrão schema-first em TS.',
  },
  {
    question: 'Qual método Zod devolve resultado sem throw?',
    options: [
      'parse()',
      'safeParse() — retorna { success: true, data } | { success: false, error }',
      'Zod sempre dá throw',
      'parseAsync()',
    ],
    correct: 1,
    explanation: 'parse() lança erro em caso de falha. safeParse() retorna discriminated union com success. Em boundaries (API, form, localStorage), safeParse é quase sempre melhor — você lida com erro explicitamente em vez de catch.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="type-safety-em-boundaries"
      title="Type safety em boundaries: Zod, io-ts e validação runtime"
      icon="🛡️"
      xp={55}
      readTime={12}
      trailName="TypeScript Profissional"
      trailColor={accent}
      nextSlug="async-await-sem-pegadinha"
      nextTitle="Async/await sem pegadinha: promises, AbortController e cancelamento"
      quiz={quiz}
    >
      <Section title="O mito: &quot;TypeScript garante que não quebra&quot;" accent={accent}>
        <p>
          É o engano mais comum de devs júnior em TS. Veja:
        </p>
        <CodeBlock lang="typescript">{`interface User { id: string; email: string; age: number; }
const res = await fetch('/api/users/1');
const user: User = await res.json();  // 👀 PERIGOSO
console.log(user.email.toUpperCase()); // 💥 se email vier null em runtime`}</CodeBlock>
        <p>
          O cast <InlineCode>as User</InlineCode> (implícito no <InlineCode>: User</InlineCode>) é uma <em>asserção falsa</em> no runtime. A API pode mudar; campo pode vir null; servidor pode ter bug. TS não sabe de nada disso.
        </p>
        <Callout tone="warn" icon="⚠️">
          Todo boundary (API, form, localStorage, URL param, env var) é uma fronteira onde tipos TS param de valer. Precisa de validação runtime.
        </Callout>
      </Section>

      <Section title="Zod: schema é código, tipo é derivado" accent={accent}>
        <CodeBlock lang="typescript">{`import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  age: z.number().int().nonnegative(),
});

// Tipo inferido — ÚNICA fonte de verdade
type User = z.infer<typeof UserSchema>;

async function fetchUser(id: string): Promise<User | null> {
  const res = await fetch(\`/api/users/\${id}\`);
  const raw = await res.json();
  const parsed = UserSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('API shape divergiu:', parsed.error);
    return null;
  }
  return parsed.data; // agora é User com garantia runtime
}`}</CodeBlock>
      </Section>

      <Section title="Padrão: parse em toda porta de entrada" accent={accent}>
        <p>
          No FFV Academy, este site usa Zod em:
        </p>
        <ul className="list-disc pl-5 my-3 text-sm">
          <li><InlineCode>importState()</InlineCode> — JSON importado pelo usuário</li>
          <li><InlineCode>captureReferralFromUrl()</InlineCode> — param <InlineCode>?ref=</InlineCode> da URL</li>
          <li><InlineCode>getUser()</InlineCode> — leitura de localStorage (pode ter tamper)</li>
          <li><InlineCode>SimuladoAttemptSchema</InlineCode> — attempts restaurados após refresh</li>
        </ul>
        <p>
          Cada um desses é um &quot;boundary&quot;. Zod garante que a partir dali, o código roda em terreno sólido.
        </p>
      </Section>

      <Section title="Zod vs io-ts vs Valibot: escolha" accent={accent}>
        <p>
          <strong>Zod</strong>: DX mais amiga, ecossistema enorme, bundle maior (~25kb). Default recomendado.<br />
          <strong>Valibot</strong>: API parecida, bundle ~10x menor (tree-shakable). Boa escolha pra frontend crítico de bundle.<br />
          <strong>io-ts</strong>: baseado em fp-ts, academicamente correto mas DX pesada. Use só se o time já pratica FP.
        </p>
        <Callout tone="info" icon="💡">
          No Next.js com static export, bundle importa. Se este site fosse refeito hoje, provavelmente migrava pra Valibot. Por ora, Zod é o pragmático.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
