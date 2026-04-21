import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('llm-as-judge-armadilhas');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "position bias" em LLM-as-judge?',
    options: [
      'Programa',
      'Quando comparando respostas A vs B pairwise, LLM tende a preferir a PRIMEIRA (~55-60%). Mitigation: run 2x com order swapped, contar só casos consistentes ou average',
      'Bug de token',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Bias real documentado (Zheng et al., 2023, "Judging LLM-as-a-Judge"). GPT-4 favorecia primeira resposta em ~60% dos pairwise. Defesa: evaluate em 2 orders (A-B e B-A); conte vitórias consistentes (+1 ganhou as 2, 0 ganhou 1); tie em disagreement. Reduz bias em ~80%.',
  },
  {
    question: 'O que é "verbosity bias"?',
    options: [
      'Sinônimos',
      'LLM-judge prefere respostas MAIS LONGAS (mesmo com mesmo conteúdo). Fix: rubric pesa conciseness; penalize length&gt; X; ou use pairwise com "qual é melhor Y considerando CONCISENESS"',
      'Deprecated',
      'Nenhum',
    ],
    correct: 1,
    explanation: 'LLMs trained em human preferences que premiam verboso. Judge copia preferência. Mitigação: rubric explícita "prefira conciso", cap em length (truncate se excede), track length como feature separada. Ou human eval pra subset calibrar.',
  },
  {
    question: 'O que é "self-enhancement bias"?',
    options: [
      'Boa auto-crítica',
      'LLM-judge prefere respostas do MESMO FAMÍLIA de modelo (GPT-4 prefere GPT-4 output vs Claude output). Fix: usar modelo de família diferente como judge, ou ensemble de judges de familias diversas',
      'Nenhum',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Zheng et al. 2023: GPT-4 judge prefere GPT-4 output, Claude prefere Claude. Styles familiares parecem "melhores" pro judge da mesma família. Mitigation: cross-family judge (avaliar GPT com Claude), ensemble de 2-3 families, ou calibrar com human sample.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="llm-as-judge-armadilhas"
      title="LLM-as-judge: armadilhas e mitigações"
      icon="⚖️"
      xp={55}
      readTime={13}
      trailName="LLM Evals Profissional"
      trailColor={accent}
      nextSlug="eval-frameworks"
      nextTitle="Eval frameworks: Braintrust, Langfuse, Inspect, Promptfoo"
      quiz={quiz}
    >
      <Section title="Biases conhecidos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Bias', 'Sintoma', 'Mitigação']}
          rows={[
            ['Position', 'Primeira resposta preferida', 'Order swap, consistent-only counting'],
            ['Verbosity', 'Longa preferida', 'Rubric explícita, length cap'],
            ['Self-enhancement', 'Mesma família preferida', 'Cross-family judge, ensemble'],
            ['Style-over-substance', 'Formatação atraente ganha', 'Rubric focused em correctness'],
            ['Confidence', 'Tone assertivo preferido', 'Score separado pra confidence vs accuracy'],
          ]}
        />
      </Section>

      <Section title="Pairwise vs rating absoluto" accent={accent}>
        <Callout tone="info" icon="💡">
          Pairwise (A ou B melhor?) é mais confiável que rating absoluto (1-10). Humans têm difficulty consistent em rating absoluto; pairwise é reliable. Em pairwise: rubric estruturada, order swap, tie option explícito. Rating absoluto OK pra monitoring loose mas não pra decisions críticas.
        </Callout>
      </Section>

      <Section title="Human calibration obrigatório" accent={accent}>
        <p>
          Toda pipeline de LLM-judge precisa periodic calibration com human reviewers. Sample 30-50 exemplos por quarter, human rate, measure agreement com LLM judge. Se &lt; 70% agreement, judge rubric precisa revisão. Sem calibration, judge vira echo chamber.
        </p>
      </Section>
    </ModuleLayout>
  );
}
