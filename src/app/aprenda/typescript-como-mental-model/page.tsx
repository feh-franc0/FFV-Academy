import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('typescript-como-mental-model');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual afirmação descreve melhor o papel do TypeScript em relação ao JavaScript?',
    options: [
      'TypeScript substitui o runtime do JavaScript por um mais rápido',
      'TypeScript é um sistema de tipos que roda no compilador — o output é JavaScript idêntico sem os tipos',
      'TypeScript muda o comportamento do JS em runtime adicionando checagens',
      'TypeScript compila para assembly estático igual a C++',
    ],
    correct: 1,
    explanation: 'TypeScript é estritamente compile-time. O tsc apaga os tipos e emite JavaScript regular. Se você passar algo do tipo errado em runtime (ex: dado de API malformado), TS NÃO protege. Daí a importância de validar boundaries com Zod. A "mágica" de TS vive no editor e no build — zero custo runtime.',
  },
  {
    question: 'Quando o TypeScript usa "inference estrutural" em vez de "inference nominal"?',
    options: [
      'Só quando você usa a keyword "class"',
      'Nunca — TS é sempre nominal como Java',
      'Sempre que possível — TS compara shapes (estrutura), não nomes. Dois tipos com a mesma forma são compatíveis',
      'Apenas para tipos primitivos (string, number)',
    ],
    correct: 2,
    explanation: 'TS é estruturalmente tipado: se o shape bate, o tipo bate. Um {name: string, age: number} satisfaz a interface User mesmo sem declarar "implements User". Isso é fundamentalmente diferente de Java/C# (nominal). Daí a flexibilidade — e os bugs quando duas interfaces diferentes acidentalmente têm o mesmo shape.',
  },
  {
    question: 'Qual frase resume melhor a intenção de "tipos como prova"?',
    options: [
      '"Tipos garantem que meu programa nunca tem bug"',
      '"Escrever tipos é só documentação, pode ignorar"',
      '"Um tipo é uma asserção sobre o valor; o compilador verifica que o código respeita essa asserção ao longo do fluxo"',
      '"Tipos são opcionais e só servem para autocomplete"',
    ],
    correct: 2,
    explanation: 'O tipo não é "anotação decorativa": é uma afirmação que o compilador prova ao longo do control flow. Se você escreve x: string e depois x = 42, a prova falha. Essa lente muda como você projeta: escolher tipos bem é escolher invariantes bem.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="typescript-como-mental-model"
      title="TypeScript como mental model: tipos são prova, não anotação"
      icon="🧠"
      xp={45}
      readTime={11}
      trailName="TypeScript Profissional"
      trailColor={accent}
      nextSlug="narrowing-discriminated-unions"
      nextTitle="Narrowing e discriminated unions: o coração real do TypeScript"
      quiz={quiz}
      seoDesc="TypeScript como mental model: tipos como prova, inference e sistema estrutural — PT-BR."
    >
      <Section title="O clique mental: tipos são asserções provadas" accent={accent}>
        <p>
          A maioria dos devs aprende TS como <strong>&quot;JavaScript com anotações&quot;</strong>. Essa visão funciona em tutorial de 5 minutos, mas colapsa ao escrever código sério. O mental model correto é outro:
        </p>
        <Callout tone="info" icon="💡">
          Um tipo é uma <strong>asserção sobre os valores possíveis</strong>. O compilador percorre o control flow e prova que cada uso do valor respeita essa asserção. Quando a prova falha, erro de compilação.
        </Callout>
        <p>
          Isso é diferente de &quot;anotação&quot; porque assertions têm consequências lógicas. Se <InlineCode>x: string | null</InlineCode>, você <em>não pode</em> chamar <InlineCode>x.toUpperCase()</InlineCode> sem antes eliminar o <InlineCode>null</InlineCode>. O tipo força você a raciocinar sobre o caso que quebra.
        </p>
      </Section>

      <Section title="Estrutural, não nominal" accent={accent}>
        <p>
          Em Java/C#, tipos são nominais: <InlineCode>class Dog</InlineCode> e <InlineCode>class Wolf</InlineCode> são incompatíveis mesmo com a mesma API. TS é o oposto — compatibilidade por <strong>shape</strong>.
        </p>
        <CodeBlock lang="typescript">{`interface Point2D { x: number; y: number; }
interface Position { x: number; y: number; z: number; }

function plot(p: Point2D) { /* ... */ }

const pos: Position = { x: 1, y: 2, z: 3 };
plot(pos);  // ✅ funciona — pos tem pelo menos {x, y}`}</CodeBlock>
        <p>
          Isso dá flexibilidade brutal (duck typing tipado) mas exige disciplina: às vezes dois tipos acidentalmente têm o mesmo shape e colidem. Solução clássica: <strong>branded types</strong>.
        </p>
        <CodeBlock lang="typescript">{`type UserId = string & { readonly __brand: 'UserId' };
type PostId = string & { readonly __brand: 'PostId' };

declare function getUser(id: UserId): User;
const postId = 'abc' as PostId;
getUser(postId);  // ❌ erro — shapes não batem pelo brand`}</CodeBlock>
      </Section>

      <Section title="Inference é a maior feature — use-a" accent={accent}>
        <p>
          Devs que vêm de Java/C# escrevem tipos em tudo. Isso é antipattern em TS. A regra prática:
        </p>
        <Callout tone="success" icon="✅">
          <strong>Anote boundaries</strong> (funções públicas, argumentos, retornos de API). <strong>Deixe o resto ser inferido.</strong> TS infere melhor que você em 90% dos casos internos.
        </Callout>
        <CodeBlock lang="typescript">{`// Ruim — anota o óbvio
const items: string[] = ['a', 'b', 'c'];
const total: number = items.length;

// Bom — boundary anotado, resto inferido
function parseUsers(raw: unknown): User[] {
  // ...
}
const users = parseUsers(data); // User[] inferido`}</CodeBlock>
      </Section>

      <Section title="Por que isso importa na prática" accent={accent}>
        <p>
          Com o mental model certo, você para de &quot;lutar contra o TS&quot; e começa a <strong>escolher invariantes bem</strong>. Quando projeta uma função, a primeira pergunta não é mais &quot;que código escrever&quot; e sim &quot;quais tipos representam os estados válidos — de forma que os inválidos nem consigam ser expressos?&quot;. Este é o salto de júnior pra sênior em TS. Os próximos módulos da trilha operacionalizam esse princípio.
        </p>
      </Section>
    </ModuleLayout>
  );
}
