import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('golden-sets-curadoria');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é tamanho ideal de golden set inicial?',
    options: [
      '10',
      '100-200 exemplos curados, stratified (easy + medium + hard + edge cases). Cresce organicamente conforme prod reveals novos failure modes. Menos de 50 = estatisticamente fraco',
      '10000+',
      '1',
    ],
    correct: 1,
    explanation: 'Balance: suficiente pra statistical significance (&gt; 50), pouco pra manutenir (cada exemplo tem ideal answer humano). 100-200 é sweet spot starter. Growth: production failures viram examples + stratification coverage.',
  },
  {
    question: 'O que "stratified sampling" em golden set garante?',
    options: [
      'Random',
      'Cobertura balanceada de: task types, difficulty levels, edge cases, demographic diversity. Evita "dataset só easy cases" onde FT parece genial mas falha em hard reality',
      'Só easy',
      'Só hard',
    ],
    correct: 1,
    explanation: 'Sem stratification: 80% easy, 15% medium, 5% hard por sorte. Modelo otimiza pra easy. Stratified: por design cover edge cases (ambiguous input, long context, rare categories). Reflects production distribution OR covers blind spots explicitly.',
  },
  {
    question: 'Como mantém golden set "vivo" em produção?',
    options: [
      'Freeze',
      'Pipeline de capture: production failures identificadas por user feedback OU LLM judge → human review → adicionar ao golden set. Remove exemplos obsoletos (task changed). Grows 20-50/mês em app ativo',
      'Nunca atualizar',
      'Recriar do zero',
    ],
    correct: 1,
    explanation: 'Golden set estático não serve — produto evolui, edge cases novos emergem. Workflow: Langfuse/Braintrust capturam failures, human review "isso devia ter respondido X", adiciona. Remove: examples onde comportamento esperado mudou (feature deprecada). Eval set é code too.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="golden-sets-curadoria"
      title="Golden sets: curadoria + manutenção + growth"
      icon="🏆"
      xp={50}
      readTime={12}
      trailName="LLM Evals Profissional"
      trailColor={accent}
      nextSlug="llm-as-judge-armadilhas"
      nextTitle="LLM-as-judge: armadilhas e mitigações"
      quiz={quiz}
    >
      <Section title="Estrutura de exemplo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>input</strong>: o que user/system envia ao LLM</li>
          <li><strong>expected_output</strong>: resposta ideal (string ou structured)</li>
          <li><strong>tags</strong>: task type, difficulty, cases edge</li>
          <li><strong>metadata</strong>: source (synthetic vs production failure), date added, reviewer</li>
          <li><strong>notes</strong>: por que é expected esse output (reasoning pra reviewer futuro)</li>
        </ul>
      </Section>

      <Section title="Annotator agreement" accent={accent}>
        <Callout tone="info" icon="💡">
          Pra eval rigoroso: 2-3 annotators independently label cada exemplo. Measure Cohen kappa (&gt; 0.7 bom alinhamento). Disagreements = reconcile discussão + update guidelines. Low agreement = task mal definida, não dataset problem.
        </Callout>
      </Section>

      <Section title="Evitar contamination" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Golden set PRIVADO — não compartilhar com model providers (treino absorve)</li>
          <li>Não publicar em GitHub público sem hash/encryption</li>
          <li>Hash-based dedup contra training datasets conhecidos (Common Crawl, etc)</li>
          <li>Periodic re-curation: 10-20% novos exemplos vs &quot;frozen&quot; set antigo</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
