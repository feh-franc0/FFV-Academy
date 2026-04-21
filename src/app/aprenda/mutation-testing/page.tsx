import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('mutation-testing');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'O que mutation testing faz que line coverage não faz?',
    options: [
      'Nada novo',
      'Muta o CÓDIGO (troca + por -, remove ifs, inverte booleanos). Se testes ainda passam com mutação, testes não cobrem aquela lógica de verdade. Mede QUALIDADE do teste, não quantidade de linhas executadas',
      'Só é mais bonito',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Line coverage 100% pode existir sem assertions (só executa, não verifica). Mutation testing muda código; se testes não falham, significa que a mudança passou despercebida → assertion fraca. Stryker (JS/TS), PIT (Java), mutmut (Python).',
  },
  {
    question: 'Por que mutation testing não é padrão em PR?',
    options: [
      'É',
      'É LENTO — roda testes completos por cada mutação (centenas/milhares). Nos PRs roda com escopo (--since), mas mutation run completa é job nightly ou weekly',
      'Não funciona',
      'Só pra Java',
    ],
    correct: 1,
    explanation: 'Test suite de 10s × 500 mutações = 80min. Inviável em cada PR. Estratégias: run nightly com relatório, ou em PR só arquivos mudados (--since). Mutation score como tendência — fail build se diminui vs baseline.',
  },
  {
    question: 'O que é "equivalent mutant"?',
    options: [
      'Código idêntico',
      'Mutação que é SEMANTICAMENTE equivalente ao original (ex: x+0 = x) — testes nunca vão pegar. False positive na mutation tool. Tools modernas filtram a maioria mas alguns escapam',
      'Mutação boa',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Equivalent mutant é limit teórico — não há teste que pode detectá-lo. Tools tentam evitar (não mutam "+ 0" em ints), mas casos sutis escapam. Por isso mutation score raramente é 100%; ~80-90% já é excelente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mutation-testing"
      title="Mutation testing com Stryker: testando os testes"
      icon="🧬"
      xp={55}
      readTime={12}
      trailName="Testing Engineering"
      trailColor={accent}
      nextSlug="integration-vs-contract-vs-e2e"
      nextTitle="Integration, contract, e2e: fronteiras claras"
      quiz={quiz}
    >
      <Section title="Stryker em TS" accent={accent}>
        <CodeBlock lang="bash">{`npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner

# stryker.conf.mjs
export default {
  packageManager: 'npm',
  testRunner: 'vitest',
  mutate: ['src/**/*.ts', '!src/**/*.test.ts'],
  coverageAnalysis: 'perTest',
  thresholds: { high: 80, low: 70, break: 60 },
};

# Run
npx stryker run

# Output mutation score por arquivo
# HTML report com killed/survived mutações`}</CodeBlock>
      </Section>

      <Section title="Tipos de mutação" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Arithmetic</strong>: + → -, * → /</li>
          <li><strong>Comparison</strong>: &gt; → &gt;=, === → !==</li>
          <li><strong>Boolean</strong>: && → ||, true → false</li>
          <li><strong>Conditional</strong>: remove if branch</li>
          <li><strong>String</strong>: &quot;abc&quot; → &quot;&quot;</li>
          <li><strong>Update</strong>: i++ → --i</li>
        </ul>
      </Section>

      <Section title="Exemplo de teste fraco pego por mutação" accent={accent}>
        <CodeBlock lang="typescript">{`// Código
function isAdult(age: number): boolean {
  return age >= 18;
}

// Teste fraco (passa em 100% line coverage)
test('isAdult', () => {
  expect(isAdult(20)).toBe(true);
});

// Mutação: return age >= 18 → return age > 18
// Teste PASSA mesmo com bug (20 > 18 também é true)
// Stryker detecta e reporta "mutation survived"

// Teste forte
test('isAdult limite', () => {
  expect(isAdult(17)).toBe(false);
  expect(isAdult(18)).toBe(true);   // mata a mutação >= → >
  expect(isAdult(19)).toBe(true);
});`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Mutation score alto (&gt;80%) correlaciona com testes que realmente pegam bugs. Instrumentação pesada — rode nightly, não em PR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
