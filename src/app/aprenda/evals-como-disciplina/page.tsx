import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('evals-como-disciplina');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que "vibes-based testing" de LLM é problema?',
    options: [
      'Nenhum',
      'Subjetivo, não escalável, regression invisível. Dev muda prompt, "parece ok", ships. Descobre 3 semanas depois que quebrou 30% dos casos. Sem métricas objetivas, iteração é às cegas',
      'Sempre OK',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'LLM apps fáceis de "prototipar" sem evals — parece funcionar em 5 prompts. Escalar sem rigor = regression silenciosa. Vibes = "eu acho que melhorou" não resolve: review precisa data, não opiniões. Disciplina de eval (golden set, métricas, A/B) separa amador de pro.',
  },
  {
    question: 'Por que BLEU/ROUGE são insuficientes pra generative tasks?',
    options: [
      'Deprecated',
      'Medem overlap de n-grams literais com reference — penalizam paráfrases corretas e premiam verbose answers que compartilham palavras. Semantic match precisa LLM-as-judge ou embeddings similarity',
      'Funcionam sempre',
      'Só tradução',
    ],
    correct: 1,
    explanation: 'BLEU (tradução), ROUGE (summarization) — métricas clássicas pre-GPT. Calculam n-gram overlap. Em LLM generation moderna, respostas corretas podem divergir muito em fraseado — BLEU baixo ≠ resposta errada. Ao contrário: keyword stuffing (copiar palavras) infla BLEU sem qualidade real.',
  },
  {
    question: 'Como encarar eval de LLM como disciplina?',
    options: [
      'Só reviews',
      'Research-like: dataset curado (golden set), hipóteses testáveis ("reranker melhora accuracy?"), múltiplas métricas (accuracy, cost, latency), statistical significance, regression suite, iteração dirigida por data',
      'Aleatório',
      'Só benchmarks famosos',
    ],
    correct: 1,
    explanation: 'ML research process aplicado: hipótese → experimento controlado → métrica → conclusão. Pra LLM prod: dataset curado em Langfuse/Braintrust, A/B prod, human feedback, LLM judge + human alignment. Produto de eval maduro não é output size do CSV — é velocidade de iteração confiante.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="evals-como-disciplina"
      title="Evals como disciplina: por que LLM testing é diferente"
      icon="🎓"
      xp={50}
      readTime={12}
      trailName="LLM Evals Profissional"
      trailColor={accent}
      nextSlug="golden-sets-curadoria"
      nextTitle="Golden sets: curadoria + manutenção + growth"
      quiz={quiz}
    >
      <Section title="4 pilares de eval profissional" accent={accent}>
        <ol className="list-decimal pl-5 my-3 text-sm space-y-2">
          <li><strong>Dataset curado</strong>: golden set representativo de task real</li>
          <li><strong>Métricas objetivas</strong>: accuracy, F1, pairwise win rate — número reproduzível</li>
          <li><strong>Observability em prod</strong>: traces + user feedback (thumbs) + outcome metrics</li>
          <li><strong>Regression suite</strong>: capturar failures em prod pra evitar regredir</li>
        </ol>
      </Section>

      <Section title="Anti-padrão: eval bolted-on tarde" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Time builds LLM app, ships, só depois tenta &quot;medir qualidade&quot;. Sem baseline, sem golden set, sem trace. Next: debugar complaint de user vira arqueologia. Solução: eval DIA 1 junto com feature. Langfuse/Braintrust integrate em minutos.
        </Callout>
      </Section>

      <Section title="Cultura de data-driven LLM" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Toda mudança de prompt/model/tool tem eval dataset +/-</li>
          <li>Review decisions com métrica, não tentação</li>
          <li>Human evals periódicos alinham com automated</li>
          <li>Failures de prod alimentam golden set</li>
          <li>Regression suite bloqueia promote pra prod</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
