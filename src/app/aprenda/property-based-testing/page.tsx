import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('property-based-testing');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre example-based e property-based testing?',
    options: [
      'Cosmético',
      'Example: você escreve 3-5 casos que PENSOU. Property: framework gera 100+ inputs aleatórios (seguindo spec) e verifica INVARIANTES — acha edge cases que você nunca imaginou',
      'Property é mais lento',
      'Example é mais preciso',
    ],
    correct: 1,
    explanation: 'Example testa o que você lembrou; property testa o espaço de inputs. Ex: "reverse(reverse(x)) === x" pra qualquer string. Framework gera empty string, só espaço, emoji, XSS, 10k chars — finds bugs em edge cases reais.',
  },
  {
    question: 'O que é "shrinking" em property-based testing?',
    options: [
      'Reduzir número de tests',
      'Quando um input falha, framework REDUZ ao input MÍNIMO que ainda falha. Ex: falhou com string de 200 chars? Shrinker tenta 100, 50, 20... chega em "abc" que ainda quebra. Debug fica trivial',
      'Compactação de output',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Shrinking é a magic feature. Sem shrinking, "falhou com input de 500 chars aleatórios" é inútil pra debug. Com shrinking, você recebe counter-example mínimo. fast-check, Hypothesis, QuickCheck (original em Haskell) fazem isso.',
  },
  {
    question: 'Em que tipo de função property-based testing BRILHA?',
    options: [
      'Funções com muitos side-effects',
      'Funções PURAS com invariantes matemáticas — sort é idempotent (sort(sort(x)) === sort(x)), reverse é involutório, parse(serialize(x)) === x (roundtrip)',
      'Funções que lidam com DOM',
      'Funções de UI',
    ],
    correct: 1,
    explanation: 'Property works best com invariantes expressáveis: idempotência, associatividade, comutatividade, roundtrip (encode/decode), metamorfismo (f(x+1) = f(x)+k). Sort, parse, compression, crypto — clássicos. Em código imperativo com muitos side-effects, harder.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="property-based-testing"
      title="Property-based testing com fast-check: achar bugs em edge cases"
      icon="🎲"
      xp={60}
      readTime={13}
      trailName="Testing Engineering"
      trailColor={accent}
      nextSlug="mutation-testing"
      nextTitle="Mutation testing com Stryker: testando os testes"
      quiz={quiz}
    >
      <Section title="fast-check em TS" accent={accent}>
        <CodeBlock lang="typescript">{`import { fc, it } from '@fast-check/vitest';

// Invariante: roundtrip JSON
it.prop([fc.anything()])('JSON parse(stringify(x)) === x', (x) => {
  const round = JSON.parse(JSON.stringify(x));
  // Nota: Infinity, NaN, undefined mudam — isso é FEATURE (descobre limitação)
  expect(round).toEqual(JSON.parse(JSON.stringify(x)));
});

// Property de sort
it.prop([fc.array(fc.integer())])('sort é idempotente', (arr) => {
  const once = [...arr].sort((a, b) => a - b);
  const twice = [...once].sort((a, b) => a - b);
  expect(twice).toEqual(once);
});

// Bug clássico que property acha e example não
it.prop([fc.string()])('slugify não retorna string vazia', (input) => {
  fc.pre(input.length > 0);  // precondition
  const result = slugify(input);
  expect(result.length).toBeGreaterThan(0);
  // Vai falhar com input = "!!!!" — revela bug que você nunca pensaria
});`}</CodeBlock>
      </Section>

      <Section title="Geradores compostos" accent={accent}>
        <CodeBlock lang="typescript">{`// User válido
const userGen = fc.record({
  id: fc.uuidV(4),
  email: fc.emailAddress(),
  age: fc.integer({ min: 0, max: 150 }),
});

it.prop([userGen])('serialize/deserialize preserva User', (user) => {
  const serialized = JSON.stringify(user);
  const parsed = UserSchema.parse(JSON.parse(serialized));
  expect(parsed).toEqual(user);
});`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Regra prática: toda função pura com invariante clara deveria ter 1 property test além dos example tests. Acha bugs em produção que exemplos nunca pegariam.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
