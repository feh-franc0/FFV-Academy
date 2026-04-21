import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-eval-harness-completo');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia eval harness "portfolio-grade" de hobby?',
    options: [
      'Só tamanho',
      'Data rigor (golden set stratified 200+), métricas múltiplas (accuracy + cost + latency), statistical rigor (sig test), regression em CI, production observability (Langfuse), hypothesis-driven iterations documentadas',
      'Nenhum',
      'Só UI bonita',
    ],
    correct: 1,
    explanation: 'Hobby eval: "rodei 10 prompts, parece bom". Portfolio-grade: dataset curado com metadata, LLM judge calibrado com human sample, A/B prod com stat test, regression em PR, trace observability. Distingue engineer ML profissional de alguém que brincou com ChatGPT.',
  },
  {
    question: 'Qual hipótese típica vale testar em capstone?',
    options: [
      'Aleatória',
      'Specific, mensurável: "adicionar reranker Cohere antes do LLM melhora accuracy em &gt;5%?" ou "prompt v2 com few-shot reduz cost/request em 30%?". Design experiment pra responder com data',
      'Geral',
      'Sem hipótese',
    ],
    correct: 1,
    explanation: 'Boa hipótese: (1) acionável (é mudança concreta), (2) mensurável (número esperado), (3) meaningful (efeito real importa ao produto). Exemplo ruim: "melhorar qualidade". Bom: "X change aumenta pairwise win vs baseline em &gt; 10% em golden set (p&lt;0.05)". Run experiment, documento resultado.',
  },
  {
    question: 'Qual é o entregável final ideal pra recrutador?',
    options: [
      'Código bruto',
      'Blog post ou README estruturado: hypothesis, experimental setup, results (with charts), statistical analysis, trade-offs, next iterations. Link pra repo + dashboard live. Mostra THOUGHT PROCESS',
      'Só repo',
      'PDF',
    ],
    correct: 1,
    explanation: 'Engineer senior demonstra thinking, não só código. Writeup estruturado mostra: problema bem definido, methodology rigorosa, resultado honesto (com limitations), decisions data-driven. Blog post no Medium/Substack ou README rico. Links: repo code, Langfuse dashboard view, demo deployed.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-eval-harness-completo"
      title="Capstone: eval harness completo"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="LLM Evals Profissional"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Escolha app LLM real (RAG, agent, or assistant) e construa eval harness end-to-end. Pense como research project: hypothesis → experimento → result → decision.
        </p>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Eval Harness Capstone — Entregáveis

## 1. Dataset (golden set)
- 200+ exemplos curados, stratified (easy/medium/hard + task types)
- Metadata: difficulty, task, source
- Annotator agreement measure (Cohen kappa)
- Contamination check contra training data

## 2. Métricas & Framework
- Structured metrics (F1, accuracy) pra estruturado
- LLM-as-judge pairwise com cross-family (GPT judges Claude, vice-versa)
- Human calibration sample 50+ com agreement &gt; 70%
- Cost + latency tracking per request

## 3. Hypothesis testing
- Hipótese clara (ex: "reranker Cohere+ improves accuracy 5%+")
- Experimental setup documentado
- Results com confidence intervals
- Decision: promote or reject

## 4. Regression suite em CI
- 50+ test cases capturados de prod failures
- GitHub Actions workflow passando em cada PR
- Guard rails: cost/latency caps

## 5. Production observability
- Langfuse instrumentado (or similar)
- Dashboard live: qualidade over time, cost, user feedback
- Alert rules (thumbs down spike, cost explosion)

## 6. Writeup
- Blog post or README estruturado
- Charts (matplotlib/Plotly)
- Limitations e next steps honestos
- Link pra repo + dashboard + deploy`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Capstone que define engineer ML moderno. Recruiter/hiring manager lê writeup, vê rigor científico + engineering pragmatism + decisions justificadas por data. Esse é o nível que vale $150-300k+ em 2026.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
