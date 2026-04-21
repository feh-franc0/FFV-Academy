import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tipos-utilitarios-e-quando-nao-usar');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando usar `Partial<T>` é sinal de MODELAGEM FRACA?',
    options: [
      'Nunca — Partial sempre é bom',
      'Quando o "objeto parcial" é um estado legítimo do domínio e deveria ter seu próprio tipo (ex: UserDraft) em vez de Partial<User>',
      'Apenas quando T tem mais de 5 campos',
      'Só em classes',
    ],
    correct: 1,
    explanation: 'Partial<User> diz "qualquer subset de User vale". Mas na prática "rascunho" tem regras próprias — email precisa estar presente, id não. Melhor: declare UserDraft explicitamente. Partial é ótimo pra patches (PATCH API), mas evite em domínio.',
  },
  {
    question: 'O que faz `Record<K, V>`?',
    options: [
      'Cria uma classe mutável',
      'Um alias pra {[key in K]: V} — objeto com chaves do conjunto K e valores V',
      'Grava mudanças em log',
      'É o mesmo que Map<K, V>',
    ],
    correct: 1,
    explanation: 'Record<K, V> é dict tipado: Record<"a" | "b", number> = {a: number, b: number}. Usado em configs, state reducers, maps literais. Diferente de Map (estrutura em runtime).',
  },
  {
    question: 'Quando escolher `Omit<T, K>` em vez de `Pick<T, K>`?',
    options: [
      'São sempre intercambiáveis',
      'Omit quando você quer "tudo exceto alguns campos" (fica mais legível); Pick quando você quer "só esses campos"',
      'Omit é mais rápido no compilador',
      'Pick só funciona em interfaces, Omit em tipos',
    ],
    correct: 1,
    explanation: 'Diferença é expressiva. Se User tem 10 campos e você quer 8, use Omit<User, "password" | "secret"> — lista curta. Se quer 2, use Pick<User, "id" | "name">. Legibilidade ganha.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tipos-utilitarios-e-quando-nao-usar"
      title="Tipos utilitários (Partial, Pick, Omit...) e quando NÃO usar"
      icon="🧰"
      xp={45}
      readTime={10}
      trailName="TypeScript Profissional"
      trailColor={accent}
      nextSlug="type-safety-em-boundaries"
      nextTitle="Type safety em boundaries: Zod, io-ts e validação runtime"
      quiz={quiz}
    >
      <Section title="O arsenal — o que vem no lib padrão" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'O que faz', 'Quando usar']}
          rows={[
            ['Partial<T>', 'Todos os campos opcionais', 'PATCH, merge, form draft (cuidado: veja armadilha)'],
            ['Required<T>', 'Todos os campos obrigatórios', 'Garantir que nada é opcional após setup'],
            ['Readonly<T>', 'Todos os campos readonly', 'Imutabilidade superficial'],
            ['Pick<T, K>', 'Seleciona só K', 'Subconjunto explícito (poucos campos)'],
            ['Omit<T, K>', 'Remove K', 'Tudo exceto alguns (muitos campos, poucas exceções)'],
            ['Record<K, V>', 'Dict K → V', 'Mapa tipado, config, lookup'],
            ['Exclude<T, U>', 'T menos o que for atribuível a U', 'Remover variantes de union'],
            ['Extract<T, U>', 'T interseccionado com U', 'Pegar só variantes que casam'],
            ['NonNullable<T>', 'T sem null/undefined', 'Garantir valor presente'],
            ['ReturnType<F>', 'Tipo de retorno de função F', 'Inferir retorno sem chamar'],
            ['Awaited<T>', 'Desempacota Promise<T>', 'Extrair tipo resolvido'],
          ]}
        />
      </Section>

      <Section title="A armadilha: Partial escondendo modelagem fraca" accent={accent}>
        <p>
          É tentador usar <InlineCode>Partial&lt;User&gt;</InlineCode> pra representar &quot;estou criando um User aos poucos&quot;. Mas isso descarta invariantes: um &quot;rascunho&quot; na verdade tem regras próprias.
        </p>
        <CodeBlock lang="typescript">{`// Antipattern
type UserDraft = Partial<User>;
// Problema: { email: undefined, id: 'abc' } compila — invariante perdido

// Melhor: modelar o rascunho explicitamente
type UserDraft = {
  email: string;          // obrigatório no draft
  name?: string;          // opcional no draft
  age?: number;
  // id NÃO existe até save
};

type User = UserDraft & { id: string; createdAt: string };`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Use <InlineCode>Partial</InlineCode> sem medo em <strong>patches</strong> (input de PATCH API, reduce/merge helpers). Evite pra <strong>estados de domínio</strong> — modele o estado com seu próprio tipo.
        </Callout>
      </Section>

      <Section title="Record vs Map: estrutural vs runtime" accent={accent}>
        <CodeBlock lang="typescript">{`// Record: tipo estrutural, valor é objeto
const theme: Record<'light' | 'dark', string> = {
  light: '#fff',
  dark: '#000',
};

// Map: estrutura em runtime (preserva ordem, chaves não-string)
const metrics = new Map<UserId, number>();
metrics.set('abc' as UserId, 42);`}</CodeBlock>
        <p>
          Record é melhor pra configs com chaves conhecidas (poucas, fixas). Map é melhor pra dados dinâmicos (chaves desconhecidas, muitas inserções/remoções, precisa de <InlineCode>size</InlineCode>, iteração ordenada).
        </p>
      </Section>

      <Section title="Quando NÃO usar utilitários" accent={accent}>
        <p>
          A regra: se seu tipo nomeado é &quot;usado uma vez e tem significado&quot;, <strong>nomeie-o</strong>. Combinações monstruosas como <InlineCode>Omit&lt;Pick&lt;User, &#39;name&#39; | &#39;email&#39;&gt;, &#39;email&#39;&gt;</InlineCode> viram ilegíveis. Crie <InlineCode>type PublicProfile = {'{ name: string }'}</InlineCode> e fim.
        </p>
      </Section>
    </ModuleLayout>
  );
}
