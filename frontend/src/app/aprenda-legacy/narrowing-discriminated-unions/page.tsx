import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('narrowing-discriminated-unions');

const accent = '#3178c6';

const quiz: QuizQuestion[] = [
  {
    question: 'Você tem `const x: string | null`. O TS não permite `x.length` direto. Qual é a forma CANÔNICA de resolver?',
    options: [
      'Usar `(x as string).length` sempre',
      'Narrowing: `if (x !== null) { x.length }` — o TS estreita o tipo dentro do bloco',
      'Mudar o tipo pra `any` para compilar',
      'Adicionar `x!.length` em tudo',
    ],
    correct: 1,
    explanation: 'Narrowing é o nome do mecanismo: uma condição (typeof, instanceof, igualdade, truthiness) estreita o tipo dentro do bloco. `if (x !== null)` remove null do domínio. `as` e `!` desligam a checagem — use-os só quando sabe algo que o TS não pode provar (última escolha).',
  },
  {
    question: 'O que é uma "discriminated union" (tagged union)?',
    options: [
      'Qualquer union type',
      'Union onde cada variante tem um campo tag literal em comum (ex: kind: "ok" | "err") — o TS usa essa tag para narrowing exaustivo',
      'Union que só funciona com generics',
      'Feature exclusiva de enums',
    ],
    correct: 1,
    explanation: 'Discriminated union = union + discriminant (campo literal que diferencia cada variante). Ex: type Result = {kind: "ok", value: T} | {kind: "err", error: E}. O TS usa esse campo para narrowing: dentro de if (r.kind === "ok"), r é automaticamente a variante ok.',
  },
  {
    question: 'Para que serve o `never` em um switch/case?',
    options: [
      'Dizer que aquele branch nunca executa (exhaustiveness check)',
      'Marcar tipo privado',
      'Forçar uma função a retornar void',
      'Dar erro sempre para qualquer input',
    ],
    correct: 0,
    explanation: 'O padrão é: no default do switch, atribua `const _exhaust: never = x`. Se você esqueceu uma variante da union, o TS reclama que o tipo remanescente NÃO é never. Compila só se cobrir tudo. Isso transforma o switch em exhaustiveness check enforçado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="narrowing-discriminated-unions"
      title="Narrowing e discriminated unions: o coração real do TypeScript"
      icon="🎯"
      xp={55}
      readTime={13}
      trailName="TypeScript Profissional"
      trailColor={accent}
      nextSlug="generics-de-verdade"
      nextTitle="Generics de verdade: variance, constraints e conditional types"
      quiz={quiz}
      seoDesc="TypeScript narrowing e discriminated unions: guia profissional PT-BR com exhaustiveness."
    >
      <Section title="Narrowing: estreitando tipo dentro de um bloco" accent={accent}>
        <p>
          A partir de uma union ampla, condições estreitam o tipo dentro do bloco. Os analisadores são:
        </p>
        <ul className="list-disc pl-5 my-3 text-sm">
          <li><InlineCode>typeof x === &#39;string&#39;</InlineCode></li>
          <li><InlineCode>x instanceof MyClass</InlineCode></li>
          <li><InlineCode>&#39;foo&#39; in x</InlineCode> (property check)</li>
          <li><InlineCode>x === null</InlineCode>, <InlineCode>x !== undefined</InlineCode> (equality)</li>
          <li>Truthiness: <InlineCode>if (x)</InlineCode> remove null/undefined/&quot;&quot;/0</li>
          <li>User-defined type guards: <InlineCode>function isCat(x): x is Cat</InlineCode></li>
        </ul>
        <Callout tone="info" icon="💡">
          Narrowing é <strong>o mecanismo central</strong> de TS — dominar os 6 acima já resolve ~80% dos casos onde iniciantes usam <InlineCode>as</InlineCode>.
        </Callout>
      </Section>

      <Section title="Discriminated unions: narrowing com tag explícito" accent={accent}>
        <p>
          Quando uma union tem variantes com shapes diferentes, use um campo literal pra diferenciar. Esse campo é o <strong>discriminant</strong>.
        </p>
        <CodeBlock lang="typescript">{`type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rect'; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2;  // s: Circle
    case 'square': return s.size ** 2;              // s: Square
    case 'rect':   return s.w * s.h;                // s: Rect
    default: {
      const _exhaustive: never = s;  // 🔒 compila só se cobrir tudo
      return _exhaustive;
    }
  }
}`}</CodeBlock>
        <p>
          Se amanhã você adicionar <InlineCode>{'{ kind: \'triangle\' }'}</InlineCode> à union, o <InlineCode>never</InlineCode> do default vira erro de compilação. Você é <strong>forçado</strong> a atualizar a função. É impossível esquecer — o compilador garante.
        </p>
      </Section>

      <Section title="Result&lt;T, E&gt;: o padrão Rust em TS" accent={accent}>
        <p>
          A aplicação mais útil de discriminated union: representar sucesso/erro <em>sem</em> throw.
        </p>
        <CodeBlock lang="typescript">{`type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseJson<T>(raw: string): Result<T, SyntaxError> {
  try { return { ok: true, value: JSON.parse(raw) }; }
  catch (e) { return { ok: false, error: e as SyntaxError }; }
}

const r = parseJson<User>(raw);
if (r.ok) console.log(r.value.name);  // r.value: User
else console.error(r.error);          // r.error: SyntaxError`}</CodeBlock>
        <p>
          Vantagem: a assinatura mostra que pode falhar. Chamadores não esquecem de tratar. Throw, ao contrário, é <em>goto tipado fraco</em> — a assinatura mente. Módulo <em>Erros como valores</em> aprofunda isso.
        </p>
      </Section>

      <Section title="`as` é o sinal de que narrowing falhou" accent={accent}>
        <p>
          Sempre que você escrever <InlineCode>value as SomeType</InlineCode>, pergunte: <em>o TS tem como provar isso narrowing?</em> Se sim, refatore. <InlineCode>as</InlineCode> é uma afirmação ao compilador: &quot;confia em mim&quot;. Se errar, bug em runtime silencioso — que é justamente o que TS deveria prevenir.
        </p>
        <Callout tone="warn" icon="⚠️">
          Exceção legítima de <InlineCode>as</InlineCode>: boundaries. Ex: <InlineCode>JSON.parse()</InlineCode> retorna <InlineCode>any</InlineCode>; você cast pra <InlineCode>unknown</InlineCode> e valida com Zod. Aí o <InlineCode>as</InlineCode> inicial está ancorado em validação real.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
