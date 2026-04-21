import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tdd-bdd-quando-funcionam');

const accent = '#22c55e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o ciclo canônico de TDD?',
    options: [
      'Code → test → refactor',
      'Red (escreva teste que falha) → Green (código mínimo pra passar) → Refactor (melhore design sem quebrar tests). Repetir',
      'Write tests first, code later',
      'Só refactor',
    ],
    correct: 1,
    explanation: 'Kent Beck — 3 fases. Red força você a pensar na API do código ANTES de escrever. Green evita over-engineering (só o mínimo). Refactor aproveita rede de segurança. Ciclo de 2-10min. "Write tests first" é simplificação ruim — ciclo curto é o essencial.',
  },
  {
    question: 'O que é "outside-in TDD" (London school)?',
    options: [
      'TDD começando pelo banco',
      'Começar pelos collaborators do alto (API/UI), mockar downstream; ir preenchendo pra dentro (inside-out é o oposto: começar nos utils)',
      'Outside-in é nome antigo',
      'Só pra JS',
    ],
    correct: 1,
    explanation: 'Outside-in (London, Steve Freeman/Nat Pryce) — tests de alto nível mockam o restante; você desce no grafo preenchendo. Mais natural pra arquitetura top-down. Inside-out (Chicago, Detroit) — começa nos leaves, compõe. Ambos funcionam; escolha baseado em como você pensa.',
  },
  {
    question: 'Quando BDD (Cucumber/Gherkin) vale a pena?',
    options: [
      'Sempre',
      'Quando há stakeholder NÃO-DEV (PM, QA, regulatório) que precisa ler specs. Se só devs leem, Gherkin é overhead — pytest/vitest com descriptive names entrega mesmo valor',
      'Nunca',
      'Só em apps grandes',
    ],
    correct: 1,
    explanation: 'BDD nasceu pra bridge dev↔business. Given-When-Then em arquivo .feature. Útil em empresa com analistas de negócio revisando specs. Em time só de devs, vira ritual sem proveito — prefira describe/it natural.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tdd-bdd-quando-funcionam"
      title="TDD e BDD: quando ajudam e quando viram cerimônia"
      icon="🔴"
      xp={50}
      readTime={12}
      trailName="Testing Engineering"
      trailColor={accent}
      nextSlug="test-doubles-rigorosos"
      nextTitle="Test doubles: mock, stub, fake, spy, dummy (Meszaros)"
      quiz={quiz}
    >
      <Section title="Red-Green-Refactor em prática" accent={accent}>
        <CodeBlock lang="typescript">{`// RED: teste falha (função ainda não existe)
it('slug converte espaços pra hífens', () => {
  expect(slugify('Hello World')).toBe('hello-world');
});

// GREEN: código mínimo que passa
export function slugify(s: string): string {
  return s.toLowerCase().replace(/ /g, '-');
}

// REFACTOR: melhorar sem quebrar
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}`}</CodeBlock>
      </Section>

      <Section title="BDD Gherkin exemplo" accent={accent}>
        <CodeBlock lang="gherkin">{`Feature: Checkout com cupom
  Scenario: Cupom válido dá 10% de desconto
    Given um carrinho com R$ 100
    And o usuário aplica cupom "SAVE10"
    When o checkout é finalizado
    Then o total deve ser R$ 90`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Gherkin é só sintaxe. O valor real é ter PM lendo/editando. Se PM não lê, você pagou complexidade (step definitions, framework) sem ganhar nada.
        </Callout>
      </Section>

      <Section title="Quando TDD NÃO ajuda" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Exploração</strong>: você não sabe qual API quer — spike antes de TDD.</li>
          <li><strong>UI visual</strong>: ver pixel na tela é mais rápido que test.</li>
          <li><strong>Integration complexa</strong>: mock hell. Melhor integration test real.</li>
          <li><strong>Refactor grande</strong>: characterization tests, não TDD.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
