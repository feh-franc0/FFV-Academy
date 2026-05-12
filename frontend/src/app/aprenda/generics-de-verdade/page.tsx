import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('generics-de-verdade');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Para que serve `T extends U` em generics?',
    options: [
      'Forçar T a herdar de U em runtime',
      'Constraint: T pode ser qualquer tipo desde que seja atribuível a U. O TS garante que T tem todas as propriedades de U',
      'Criar uma classe filha',
      'Marcar T como opcional',
    ],
    correct: 1,
    explanation: '`extends` em generics é constraint estrutural — T pode ser string, {name: string}, ou qualquer tipo compatível com U. Diferente de class extends (herança). Ex: `function getName<T extends {name: string}>(x: T)` aceita qualquer objeto com `name: string`.',
  },
  {
    question: 'O que faz `infer` em conditional types?',
    options: [
      'Infere um tipo dentro de um pattern match — extrai uma "parte" do tipo',
      'Adiciona comentário para documentação',
      'Executa código em runtime pra descobrir tipo',
      'Remove o tipo e vira `any`',
    ],
    correct: 0,
    explanation: '`infer` captura um tipo dentro de um pattern. Ex: `type ReturnType<F> = F extends (...args: any) => infer R ? R : never`. O `infer R` é "pegue o que está nesta posição e chame de R". Essencial pra metaprogramação de tipos.',
  },
  {
    question: 'Qual é a diferença entre covariance e contravariance?',
    options: [
      'São nomes antigos de extends/super',
      'Covariance: A<Gato> é subtipo de A<Animal> (direção igual). Contravariance: A<Animal> é subtipo de A<Gato> (direção invertida — típico de parâmetros de função)',
      'Covariance só funciona com números',
      'Diferença cosmética, sem efeito prático',
    ],
    correct: 1,
    explanation: 'Co = na mesma direção (Array<Cat> → Array<Animal> porque ler um Cat também é ler um Animal). Contra = invertido (function(Animal) → function(Cat) porque se você aceita qualquer Animal, aceita Cat). TS é bivariante em parâmetros por default (flag strictFunctionTypes ativa contravariance).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="generics-de-verdade"
      title="Generics de verdade: variance, constraints e conditional types"
      icon="⚙️"
      xp={60}
      readTime={14}
      trailName="TypeScript Profissional"
      trailColor={accent}
      nextSlug="tipos-utilitarios-e-quando-nao-usar"
      nextTitle="Tipos utilitários (Partial, Pick, Omit...) e quando NÃO usar"
      quiz={quiz}
    >
      <Section title="Generics são parâmetros de tipo" accent={accent}>
        <p>
          Assim como uma função recebe valores, um tipo genérico recebe <strong>tipos</strong>. <InlineCode>Array&lt;T&gt;</InlineCode> é uma função-de-tipos: dado T, produz o tipo &quot;array de T&quot;. Isso elimina duplicação.
        </p>
        <CodeBlock lang="typescript">{`// Sem generics: duplica
function firstString(arr: string[]): string | undefined { return arr[0]; }
function firstNumber(arr: number[]): number | undefined { return arr[0]; }

// Com generic: uma função, preserva o tipo
function first<T>(arr: T[]): T | undefined { return arr[0]; }
const name = first(['a', 'b']); // name: string | undefined`}</CodeBlock>
      </Section>

      <Section title="Constraints: restringindo T" accent={accent}>
        <p>
          Quando T é qualquer coisa, você não pode fazer muito com ele. <InlineCode>extends</InlineCode> diz &quot;T tem que ter pelo menos isso&quot;.
        </p>
        <CodeBlock lang="typescript">{`function getName<T extends { text: string }>(x: T): string {
  return x.name; // ok porque T sempre tem name
}
getName({ text: 'Ana', age: 30 }); // ok, preserva age no tipo
getName({ age: 30 }); // ❌ erro: falta name`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Use constraints pra documentar &quot;o que minha função PRECISA do tipo&quot;, mas deixe T o mais livre possível — sobre-constringir tira flexibilidade.
        </Callout>
      </Section>

      <Section title="Conditional types + infer: metaprogramação sã" accent={accent}>
        <p>
          Combinação que vira sua arma pra criar tipos a partir de outros.
        </p>
        <CodeBlock lang="typescript">{`// ReturnType já vem no lib.es5, mas entenda como é feito:
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;

function fetchUser(): Promise<User> { /* ... */ }
type FetchResult = MyReturnType<typeof fetchUser>; // Promise<User>

// Awaited desempacota Promise recursivamente:
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
type User2 = Awaited<FetchResult>; // User`}</CodeBlock>
        <p>
          Isso é fundamental pra libs como tRPC, Zod, Drizzle — elas inferem toda a API a partir dos seus schemas. Dominar infer = entender como libs TS modernas funcionam.
        </p>
      </Section>

      <Section title="Variance: quando T em diferentes posições se comporta diferente" accent={accent}>
        <p>
          Considere <InlineCode>Array&lt;Cat&gt;</InlineCode> vs <InlineCode>Array&lt;Animal&gt;</InlineCode>. Como Cat é subtipo de Animal, <InlineCode>Array&lt;Cat&gt;</InlineCode> é subtipo de <InlineCode>Array&lt;Animal&gt;</InlineCode>. Isso é <strong>covariância</strong> — mesma direção.
        </p>
        <p>
          Mas <InlineCode>(x: Animal) =&gt; void</InlineCode> é subtipo de <InlineCode>(x: Cat) =&gt; void</InlineCode> (direção invertida!). Se você pode consumir qualquer Animal, pode consumir Cat. Isso é <strong>contravariância</strong>.
        </p>
        <Callout tone="warn" icon="⚠️">
          Por padrão (sem <InlineCode>strictFunctionTypes</InlineCode>), TS é <em>bivariante</em> em parâmetros de função — um bug conhecido por compatibilidade. Ligue <InlineCode>strict: true</InlineCode> no tsconfig.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
