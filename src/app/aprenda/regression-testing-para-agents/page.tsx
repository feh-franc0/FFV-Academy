import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('regression-testing-para-agents');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que agent regression testing é MAIS complexo que single-turn eval?',
    options: [
      'Igual',
      'Agent tem state multi-turn (memory, tool calls anteriores), tool selection (quais funções chamar, order), error handling (retry, fallback). Regression suite precisa simular conversation completa, não só final output',
      'Simples',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Single-turn: input → output. Agent: input → thought → tool_call → tool_result → thought → ... → output. Múltiplos pontos de decisão. Tool selection errado no step 2 cascateia. Regression: simule conversation completa, verifique tool trace + final output + metrics (steps, cost).',
  },
  {
    question: 'Como capturar failure de production pra regression test?',
    options: [
      'Manual',
      'Trace full (Langfuse/LangSmith) em cada request. User reporta failure (thumbs down) ou auto-detect (LLM judge em output). Capture trace → convert pra test case (input + expected trajectory) → add ao suite',
      'Deprecated',
      'Só manual reports',
    ],
    correct: 1,
    explanation: 'Production observability é source of regression tests. Langfuse captura cada span (LLM call, tool call). User feedback (emoji thumbs) filtra suspects. LLM judge identifica "resposta ruim sem feedback explícito". Convert para test case: input original + ideal trajectory (curated). Add ao suite, never regress again.',
  },
  {
    question: 'Como rodar regression suite de agent em CI?',
    options: [
      'Não roda',
      'Mock/record replay de tool calls (pra determinism + velocidade), run agent com each test case, validate: final output (LLM judge + rules), tool sequence matching, cost cap. Suite de 100+ cases roda em 5-10min',
      'Horas',
      'Skip em PR',
    ],
    correct: 1,
    explanation: 'Tool calls em CI seriam lentos/flaky + caros. Record-replay (pytest-recording, VCR.py): primeira run captura, subsequentes replay determinístico. Validations: final output vs expected, tool sequence matching, max_steps respected. 100 cases ≈ 5-10min em CI. Roda em PR, block merge se regression.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="regression-testing-para-agents"
      title="Regression testing pra agents: evitar regredir por mudança"
      icon="🔁"
      xp={55}
      readTime={13}
      trailName="LLM Evals Profissional"
      trailColor={accent}
      nextSlug="capstone-eval-harness-completo"
      nextTitle="Capstone: eval harness completo"
      quiz={quiz}
    >
      <Section title="Anatomia de test case agent" accent={accent}>
        <CodeBlock lang="yaml">{`# tests/agent_regression/case_001_multi_tool.yaml
name: "User asks for weather + books — uses 2 tools"
input: "Qual é o tempo em SP agora e me indique 3 livros de sci-fi"

expected:
  tools_used:
    - { name: "get_weather", args_contains: { city: "São Paulo" } }
    - { name: "search_books", args_contains: { genre: "sci-fi", count: 3 } }
  output_must_contain: ["temperatura", "sci-fi"]
  output_judge_rubric: |
    Response should:
    1. State current weather in São Paulo
    2. Recommend 3 sci-fi books with titles
    3. Be in Portuguese
  max_steps: 5
  max_cost_usd: 0.05`}</CodeBlock>
      </Section>

      <Section title="Harness em TS exemplo" accent={accent}>
        <CodeBlock lang="typescript">{`import { runAgent } from './agent';
import { loadCases, judge } from './eval-lib';

describe('Agent regression', () => {
  const cases = loadCases('tests/agent_regression/*.yaml');

  it.each(cases)('$name', async (testCase) => {
    const result = await runAgent(testCase.input, {
      maxSteps: testCase.expected.max_steps,
      toolReplay: 'record',  // replay cached tool calls
    });

    // Check tools
    for (const expected of testCase.expected.tools_used) {
      const match = result.trace.find(s => s.tool === expected.name);
      expect(match).toBeDefined();
      // validate args subset
    }

    // Check output via LLM judge
    const verdict = await judge(result.output, testCase.expected.output_judge_rubric);
    expect(verdict.pass).toBe(true);

    // Cost cap
    expect(result.totalCost).toBeLessThanOrEqual(testCase.expected.max_cost_usd);
  });
});`}</CodeBlock>
      </Section>

      <Section title="Workflow em produção" accent={accent}>
        <Callout tone="success" icon="✅">
          Production failure → Langfuse trace → convert to test case → review com team → merge ao suite. Agent core team: 5-10 regression cases/week ongoing. Suite cresce pra ~100-300 cases em 6 meses. Confiança pra iterar rápido sem break silencioso.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
